import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function POST(request: NextRequest) {
  const cookieStore = await cookies()
  const token = cookieStore.get('harvest_token')?.value

  if (!token) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { project_id, task_id, hours, spent_date, notes } = body

    if (!project_id || !task_id || !hours || !spent_date) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const response = await fetch("https://api.harvestapp.com/v2/time_entries", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        project_id,
        task_id,
        hours,
        spent_date,
        notes: notes || ""
      })
    })

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        return NextResponse.json({ error: "Not authenticated with Harvest" }, { status: 401 })
      }
      return NextResponse.json({ error: `Harvest API error: ${response.status}` }, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error creating time entry:", error)
    return NextResponse.json({ error: "Failed to create time entry" }, { status: 500 })
  }
}