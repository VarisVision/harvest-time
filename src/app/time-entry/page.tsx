"use client"

import React, { useState } from "react"
import { logout } from "../utils/logout"
import TimeEntryForm from "../components/time-entry/TimeEntryForm"
import FloatingMenu from "../components/FloatingMenu"

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
    <>
    <FloatingMenu />
    <div className="flex flex-col justify-center min-h-screen w-full max-w-lg p-4 m-auto">
      <div className="flex flex-row justify-between mb-4">
        <h2 className="text-xl font-semibold">Create New Time Entry</h2>
        <button
          onClick={handleLogout}
          disabled={logoutLoading}
          className="text-red-500 font-bold rounded hover:text-red-600 disabled:opacity-50 cursor-pointer flex items-center gap-2"
        >
          {logoutLoading ? "Logging out..." : "Log Out"}
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24">
            <path fill="currentColor" d="M5 21q-.825 0-1.412-.587T3 19V5q0-.825.588-1.412T5 3h7v2H5v14h7v2zm11-4l-1.375-1.45l2.55-2.55H9v-2h8.175l-2.55-2.55L16 7l5 5z" />
          </svg>
        </button>
      </div>

      <TimeEntryForm onSubmit={handleSubmit} />


    </div>
    </>
  )
}