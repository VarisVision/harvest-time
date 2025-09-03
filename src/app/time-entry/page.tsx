"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { logout } from "../utils/logout"
import { Autocomplete, TextField, Box } from "@mui/material"

type ProjectAssignment = {
  id: number
  client: {
    id: number
    name: string
  }
  project: {
    id: number
    name: string
  }
  task_assignments: Array<{
    id: number
    task: {
      id: number
      name: string
    }
  }>
}

type Project = {
  id: number
  name: string
  clientName: string
  tasks: Array<{
    id: number
    name: string
  }>
}

export default function TimeEntryPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [selectedTask, setSelectedTask] = useState<number | "">("")
  const [hours, setHours] = useState<string>("")
  const [date, setDate] = useState<string>("")
  const [message, setMessage] = useState<string>("")
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [logoutLoading, setLogoutLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    fetchData()
  }, [router])

  const fetchData = async () => {
    try {
      const assignmentsRes = await fetch("/api/project-assignments")

      if (assignmentsRes.status === 401) {
        router.push("/login")
        return
      }

      if (!assignmentsRes.ok) {
        throw new Error("Failed to fetch project assignments")
      }

      const assignmentsData = await assignmentsRes.json()
      
      console.log('Project assignments data:', assignmentsData)
      
      const projectMap = new Map<number, Project>()
      assignmentsData.forEach((assignment: ProjectAssignment) => {
        if (!assignment.project || !assignment.task_assignments) {
          console.warn('Invalid assignment data:', assignment)
          return
        }
        
        const projectId = assignment.project.id
        if (!projectMap.has(projectId)) {
          projectMap.set(projectId, {
            id: projectId,
            name: assignment.project.name,
            clientName: assignment.client.name,
            tasks: []
          })
        }
        const project = projectMap.get(projectId)!
        
        assignment.task_assignments.forEach((taskAssignment) => {
          if (taskAssignment.task) {
            project.tasks.push({
              id: taskAssignment.task.id,
              name: taskAssignment.task.name
            })
          }
        })
      })
      
      setProjects(Array.from(projectMap.values()))
      setLoading(false)
    } catch (error) {
      console.error("Error fetching data:", error)
      setError("Failed to fetch data")
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedProject || !selectedTask || !hours || !date) {
      setError("Please fill in all required fields")
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      const response = await fetch("/api/time-entry", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          project_id: selectedProject?.id || 0,
          task_id: selectedTask,
          hours: parseFloat(hours),
          spent_date: date,
          notes: message
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to create time entry")
      }

      setSelectedProject(null)
      setSelectedTask("")
      setHours("")
      setDate("")
      setMessage("")
      
      setError("Time entry created successfully!")
    } catch (error) {
      console.error("Error creating time entry:", error)
      setError(error instanceof Error ? error.message : "Failed to create time entry")
    } finally {
      setSubmitting(false)
    }
  }

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

  if (error && error !== "Time entry created successfully!") {
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
      {error === "Time entry created successfully!" && (
        <div className="w-full max-w-2xl mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
          {error}
        </div>
      )}
      <div className="w-full max-w-2xl mb-8">
        <h2 className="text-xl font-semibold mb-4">Create New Time Entry</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div>
            <label className="block text-sm font-medium mb-2">Project *</label>
            <Autocomplete
              options={projects}
              groupBy={(option) => option.clientName}
              getOptionLabel={(option) => option.name}
              value={selectedProject}
              onChange={(event, newValue) => {
                setSelectedProject(newValue)
                setSelectedTask("")
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder="Select a project"
                  required
                />
              )}
              renderGroup={(params) => (
                <li key={params.key}>
                  <Box sx={{ py: 0.5, px: 2, fontWeight: 'bold', color: 'text.secondary' }}>
                    {params.group}
                  </Box>
                  <ul>{params.children}</ul>
                </li>
              )}
              sx={{ width: '100%' }}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Task *</label>
            <select
              value={selectedTask}
              onChange={(e) => setSelectedTask(Number(e.target.value) || "")}
              className="w-full p-2 border rounded text-black"
              required
              disabled={!selectedProject}
            >
              <option value="">Select a task</option>
              {selectedProject && selectedProject.tasks.map((task) => (
                <option key={task.id} value={task.id}>
                  {task.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Hours *</label>
            <input
              type="number"
              step="0.25"
              min="0"
              value={hours}
              onChange={(e) => setHours(e.target.value)}
              className="w-full p-2 border rounded text-black"
              placeholder="0.00"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Date *</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full p-2 border rounded text-black"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Message</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full p-2 border rounded text-black"
              rows={3}
              placeholder="Optional notes about this time entry"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50 cursor-pointer"
          >
            {submitting ? "Saving..." : "Save Time Entry"}
          </button>
        </form>
      </div>

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