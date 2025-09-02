import { NextResponse } from "next/server"

export async function GET() {
  const clientId = process.env.HARVEST_CLIENT_ID
  const redirectUri = process.env.HARVEST_REDIRECT_URI

  if (!clientId || !redirectUri) {
    return NextResponse.json({ error: "Missing OAuth env vars" }, { status: 500 })
  }

  const authUrl = `https://id.getharvest.com/oauth2/authorize?client_id=${encodeURIComponent(
    clientId
  )}&response_type=code&redirect_uri=${encodeURIComponent(redirectUri)}`

  return NextResponse.redirect(authUrl)
}