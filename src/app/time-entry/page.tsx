"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { logout } from "../utils/logout"

type TimeEntry = {
  id: number
  notes: string
  hours: number
  spent_date: string
}

export default function TimeEntryPage() {
  const [entries, setEntries] = useState<TimeEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [logoutLoading, setLogoutLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    fetch("/api/time-entry")
      .then(async (res) => {
        if (res.status === 401) {
          router.push("/login")
          return
        }
        
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`)
        }
        
        return res.json()
      })
      .then((data: TimeEntry[] | undefined) => {
        if (data) {
          setEntries(data)
        }
        setLoading(false)
      })
      .catch((error) => {
        console.error("Error fetching time entries:", error)
        setError("Failed to fetch time entries")
        setLoading(false)
      })
  }, [router])

  const handleLogout = async () => {
    setLogoutLoading(true)
    await logout()
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <h1 className="text-2xl font-bold mb-4">Loading...</h1>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <h1 className="text-2xl font-bold mb-4 text-red-600">Error</h1>
        <p className="mb-4">{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-2xl font-bold mb-6">Your Time Entries</h1>
      <button
        onClick={handleLogout}
        disabled={logoutLoading}
        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 mb-6 disabled:opacity-50 cursor-pointer"
      >
        {logoutLoading ? "Logging out..." : "Log Out"}
      </button>
      {entries.length === 0 ? (
        <p className="text-white">No time entries found.</p>
      ) : (
        <ul className="w-full max-w-2xl space-y-2">
          {entries.map(entry => (
            <li key={entry.id} className="border p-3 rounded-lg shadow-sm">
              <div className="font-bold">{entry.spent_date}</div>
              <div className="text-white">{entry.hours}h – {entry.notes}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}