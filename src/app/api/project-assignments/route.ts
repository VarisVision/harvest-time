import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function GET() {
  const cookieStore = await cookies()
  const token = cookieStore.get('harvest_token')?.value

  if (!token) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  try {
    const response = await fetch("https://api.harvestapp.com/v2/users/me/project_assignments", {
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
    return NextResponse.json(data.project_assignments || [])
  } catch (error) {
    console.error("Error fetching project assignments:", error)
    return NextResponse.json({ error: "Failed to fetch project assignments" }, { status: 500 })
  }
}
