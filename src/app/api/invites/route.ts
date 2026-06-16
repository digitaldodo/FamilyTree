import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { treeId, role, email } = await req.json();

    if (!treeId) {
      return new NextResponse("Missing treeId", { status: 400 });
    }

    // Verify tree ownership
    const tree = await prisma.tree.findUnique({
      where: { id: treeId }
    });

    if (!tree || tree.ownerId !== session.user.id) {
      return new NextResponse("Not authorized to invite to this tree", { status: 403 });
    }

    // Check if a persistent invite for this role/tree already exists
    // If it's a general shareable link (no email)
    if (!email) {
      const existingInvite = await prisma.invite.findFirst({
        where: {
          treeId,
          role,
          email: null
        }
      });

      if (existingInvite) {
        return NextResponse.json(existingInvite);
      }
    }

    const token = crypto.randomBytes(32).toString("hex");

    const invite = await prisma.invite.create({
      data: {
        treeId,
        role: role || "VIEWER",
        token,
        email: email || null,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365 * 10), // 10 years expiration for persistent links
      }
    });

    return NextResponse.json(invite);
  } catch (error) {
    console.error("[INVITE_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
