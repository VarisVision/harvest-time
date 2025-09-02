import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code")

  if (!code) {
    return NextResponse.json({ error: "No code provided" }, { status: 400 })
  }

  const clientId = process.env.HARVEST_CLIENT_ID
  const redirectUri = process.env.HARVEST_REDIRECT_URI
  const clientSecret = process.env.HARVEST_CLIENT_SECRET

  if (!clientId || !redirectUri || !clientSecret) {
    return NextResponse.json({ error: "Missing OAuth env vars" }, { status: 500 })
  }

  const response = await fetch("https://id.getharvest.com/api/v2/oauth2/token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  })

  if (!response.ok) {
    return NextResponse.json({ error: "Failed to get token" }, { status: response.status })
  }

  const data = await response.json()

  const redirectResponse = NextResponse.redirect(new URL("/auth-success", request.url))
  redirectResponse.cookies.set("harvest_token", data.access_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  })

  return redirectResponse
}
