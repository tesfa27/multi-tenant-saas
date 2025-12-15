import { NextResponse } from "next/server";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ tenant: string }> }
) {
    const { tenant } = await params;

    // Global callback URL (Must match Google Console)
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const redirectUri = `${appUrl}/api/auth/google/callback`;

    // Encode tenant in state parameter
    const state = btoa(JSON.stringify({ tenant }));

    const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
    url.searchParams.set("client_id", process.env.GOOGLE_CLIENT_ID!);
    url.searchParams.set("redirect_uri", redirectUri);
    url.searchParams.set("response_type", "code");
    url.searchParams.set("scope", "openid email profile");
    url.searchParams.set("prompt", "select_account");
    url.searchParams.set("state", state);

    return NextResponse.redirect(url.toString());
}
