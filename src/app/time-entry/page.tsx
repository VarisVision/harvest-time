"use client"

import React, { useState } from "react"
import { logout } from "../utils/logout"
import TimeEntryForm from "../components/time-entry/TimeEntryForm"

export default function TimeEntryPage() {
  const [logoutLoading, setLogoutLoading] = useState(false)

  const handleSubmit = async (data: {
    project_id: number
    task_id: number
    hours: number
    spent_date: string
    notes: string
  }) => {
    const response = await fetch("/api/time-entry", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || "Failed to create time entry")
    }
  }

  const handleLogout = async () => {
    setLogoutLoading(true)
    await logout()
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <TimeEntryForm onSubmit={handleSubmit} />

      <button
        onClick={handleLogout}
        disabled={logoutLoading}
        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 disabled:opacity-50 cursor-pointer"
      >
        {logoutLoading ? "Logging out..." : "Log Out"}
      </button>
    </div>
  )
}