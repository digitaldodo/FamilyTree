"use server";

import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import crypto from "crypto";

// SENDGRID HELPER
const sendOTP = async (email: string, otp: string) => {
  const apiKey = process.env.SENDGRID_API_KEY;
  const fromEmail = process.env.SENDGRID_FROM_EMAIL;

  if (!apiKey || !fromEmail) {
    console.error("Missing SendGrid environment variables.");
    // In development without keys, we could log it or fail. The prompt requires us to not log it to the console in prod, but for local testing maybe we just pretend to send if keys are missing?
    // The prompt says "If a required Vercel env variable is missing, report the exact variable name rather than inventing a value."
    throw new Error("Missing SendGrid configuration: SENDGRID_API_KEY or SENDGRID_FROM_EMAIL");
  }

  const msg = {
    personalizations: [{ to: [{ email }] }],
    from: { email: fromEmail, name: "FamilyTree" },
    subject: "Your FamilyTree Password Reset Code",
    content: [
      {
        type: "text/plain",
        value: `Your password reset code is: ${otp}\n\nThis code will expire in 10 minutes.\n\nDo not share this code with anyone. If you didn't request a password reset, you can safely ignore this email.`
      },
      {
        type: "text/html",
        value: `<div style="font-family: sans-serif; max-w-lg; margin: 0 auto;">
          <h2>FamilyTree</h2>
          <p>You requested a password reset. Here is your verification code:</p>
          <h1 style="font-size: 32px; letter-spacing: 4px; color: #111;">${otp}</h1>
          <p>This code will expire in 10 minutes.</p>
          <p style="color: #666; font-size: 14px;"><strong>Security notice:</strong> Do not share this code with anyone. If you didn't request a password reset, you can safely ignore this email.</p>
        </div>`
      }
    ]
  };

  const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(msg)
  });

  if (!response.ok) {
    const err = await response.text();
    console.error("SendGrid error:", err);
    throw new Error("Failed to send email");
  }
};

export async function requestPasswordReset(email: string) {
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    
    // We intentionally return success even if user doesn't exist to prevent email enumeration
    if (!user) {
      return { success: true };
    }

    // Handle Google-only users (no password set)
    if (!user.password) {
      const accounts = await prisma.account.findMany({ where: { userId: user.id } });
      if (accounts.some(a => a.provider === 'google')) {
        // Send a notification email instead of an OTP
        const apiKey = process.env.SENDGRID_API_KEY;
        const fromEmail = process.env.SENDGRID_FROM_EMAIL;
        if (apiKey && fromEmail) {
          await fetch("https://api.sendgrid.com/v3/mail/send", {
            method: "POST",
            headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
            body: JSON.stringify({
              personalizations: [{ to: [{ email }] }],
              from: { email: fromEmail, name: "FamilyTree" },
              subject: "FamilyTree Sign-in Request",
              content: [{
                type: "text/plain",
                value: "You recently requested a password reset. However, this email address is registered using Google Sign-In and does not have a password. Please return to the login page and click 'Continue with Google'."
              }]
            })
          });
        }
        return { success: true };
      }
    }

    // Rate limiting: 1 minute cooldown
    const existingToken = await prisma.passwordResetToken.findUnique({ where: { email } });
    if (existingToken) {
      const now = new Date();
      const timeSinceLastSent = now.getTime() - existingToken.lastSent.getTime();
      if (timeSinceLastSent < 60000) {
        return { error: "Please wait 60 seconds before requesting another code." };
      }
    }

    // Generate secure 6-digit OTP
    const otp = crypto.randomInt(100000, 999999).toString();
    const tokenHash = await bcrypt.hash(otp, 10);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Save to DB
    await prisma.passwordResetToken.upsert({
      where: { email },
      update: {
        tokenHash,
        expiresAt,
        attempts: 0,
        lastSent: new Date()
      },
      create: {
        email,
        tokenHash,
        expiresAt
      }
    });

    // Send email
    await sendOTP(email, otp);

    return { success: true };
  } catch (error: any) {
    console.error("Password reset request error:", error);
    if (error.message.includes("Missing SendGrid configuration")) {
      return { error: error.message };
    }
    return { error: "An unexpected error occurred while requesting reset." };
  }
}

export async function verifyOTP(email: string, otp: string) {
  try {
    const token = await prisma.passwordResetToken.findUnique({ where: { email } });

    if (!token) {
      return { error: "Invalid or expired reset code." };
    }

    if (token.expiresAt < new Date()) {
      await prisma.passwordResetToken.delete({ where: { email } });
      return { error: "Reset code has expired. Please request a new one." };
    }

    if (token.attempts >= 5) {
      await prisma.passwordResetToken.delete({ where: { email } });
      return { error: "Too many failed attempts. Please request a new code." };
    }

    const isValid = await bcrypt.compare(otp, token.tokenHash);

    if (!isValid) {
      await prisma.passwordResetToken.update({
        where: { email },
        data: { attempts: { increment: 1 } }
      });
      return { error: "Incorrect verification code." };
    }

    // OTP is valid. We keep the token in the DB to allow password reset, 
    // but maybe set a flag or just rely on the existing expiration.
    // To prevent replay, the token is deleted during `resetPassword`.
    return { success: true };
  } catch (error) {
    console.error("OTP verify error:", error);
    return { error: "An unexpected error occurred while verifying the code." };
  }
}

export async function resetPassword(email: string, otp: string, newPassword: string) {
  try {
    const token = await prisma.passwordResetToken.findUnique({ where: { email } });

    if (!token) {
      return { error: "Invalid or expired reset code." };
    }

    if (token.expiresAt < new Date()) {
      await prisma.passwordResetToken.delete({ where: { email } });
      return { error: "Reset code has expired. Please request a new one." };
    }

    // Verify OTP again just in case
    const isValid = await bcrypt.compare(otp, token.tokenHash);
    if (!isValid) {
      return { error: "Invalid reset code." };
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user
    await prisma.user.update({
      where: { email },
      data: { password: hashedPassword }
    });

    // Invalidate token
    await prisma.passwordResetToken.delete({ where: { email } });

    return { success: true };
  } catch (error) {
    console.error("Password reset error:", error);
    return { error: "An unexpected error occurred while resetting the password." };
  }
}
