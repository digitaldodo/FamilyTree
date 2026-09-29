'use server'; export async function getGoogleClientId() { return process.env.GOOGLE_CLIENT_ID || process.env.AUTH_GOOGLE_ID || null; }
