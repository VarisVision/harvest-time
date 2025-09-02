import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function GET(request: NextRequest) {
  const cookieStore = await cookies()
  const token = cookieStore.get('harvest_token')?.value

  if (!token) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  try {
    const response = await fetch("https://api.harvestapp.com/v2/time_entries", {
      headers: {
        Authorization: `Bearer ${token}`
      },
    })

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        return NextResponse.json({ error: "Not authenticated with Harvest" }, { status: 401 })
      }
      return NextResponse.json({ error: `Harvest API error: ${response.status}` }, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data.time_entries || [])
  } catch (error) {
    console.error("Error fetching time entries:", error)
    return NextResponse.json({ error: "Failed to fetch time entries" }, { status: 500 })
  }
}