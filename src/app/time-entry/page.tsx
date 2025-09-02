"use client"

import { useEffect, useState } from "react"

type TimeEntry = {
  id: number
  notes: string
  hours: number
  spent_date: string
}

export default function TimeEntryPage() {
  const [entries, setEntries] = useState<TimeEntry[]>([])

  useEffect(() => {
    fetch("/api/time-entry")
      .then(res => res.json())
      .then((data: TimeEntry[]) => setEntries(data))
  }, [])

  return (
    <div>
      <h1>Your Time Entries</h1>
      <ul>
        {entries.map(entry => (
          <li key={entry.id}>
            {entry.spent_date}: {entry.hours}h – {entry.notes}
          </li>
        ))}
      </ul>
    </div>
  )
}