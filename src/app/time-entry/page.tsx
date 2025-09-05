"use client"

import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { logout } from "../utils/logout"
import { Autocomplete, TextField, Box, FormControl } from "@mui/material"

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
    billable: boolean
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
    billable: boolean
  }>
}

export default function TimeEntryPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [searchTerm, setSearchTerm] = useState<string>("")
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [selectedTask, setSelectedTask] = useState<{id: number, name: string, billable: boolean} | null>(null)
  const [taskSearchTerm, setTaskSearchTerm] = useState<string>("")
  const [hours, setHours] = useState<string>("")
  const [date, setDate] = useState<string>("")
  const [message, setMessage] = useState<string>("")
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [logoutLoading, setLogoutLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (projects.length > 0) {
      const lastProjectId = localStorage.getItem('lastSelectedProjectId')
      if (lastProjectId) {
        const lastProject = projects.find(p => p.id === parseInt(lastProjectId))
        if (lastProject) {
          setSelectedProject(lastProject)
          return
        }
      }
      setSelectedProject(projects[0])
    }
  }, [projects])

  useEffect(() => {
    if (selectedProject && selectedProject.tasks.length > 0) {
      const lastTaskId = localStorage.getItem('lastSelectedTaskId')
      if (lastTaskId) {
        const lastTask = selectedProject.tasks.find(t => t.id === parseInt(lastTaskId))
        if (lastTask) {
          setSelectedTask(lastTask)
          return
        }
      }
      setSelectedTask(selectedProject.tasks[0])
    } else {
      setSelectedTask(null)
    }
  }, [selectedProject])


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
            console.log('Task assignment data:', taskAssignment)
            project.tasks.push({
              id: taskAssignment.task.id,
              name: taskAssignment.task.name,
              billable: taskAssignment.billable !== false
            })
          }
        })
      })
      
      const projectsArray = Array.from(projectMap.values()).sort((a, b) => {
        if (a.clientName === b.clientName) {
          return a.name.localeCompare(b.name)
        }
        return a.clientName.localeCompare(b.clientName)
      })
      setProjects(projectsArray)
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
          task_id: selectedTask?.id || 0,
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
      setSelectedTask(null)
      setHours("")
      setDate("")
      setMessage("")
      setSearchTerm("")
      setTaskSearchTerm("")
      
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
              value={selectedProject}
              onChange={(event, newValue) => {
                setSelectedProject(newValue)
                if (newValue) {
                  localStorage.setItem('lastSelectedProjectId', newValue.id.toString())
                }
                setSelectedTask(null)
                setTaskSearchTerm("")
              }}
              inputValue={searchTerm}
              onInputChange={(event, newInputValue) => {
                setSearchTerm(newInputValue)
              }}
              options={projects}
              filterOptions={(options, { inputValue }) => {
                const filtered = options.filter(option => 
                  option.name.toLowerCase().includes(inputValue.toLowerCase()) ||
                  option.clientName.toLowerCase().includes(inputValue.toLowerCase())
                )
                return filtered
              }}
              getOptionLabel={(option) => option.name}
              groupBy={(option) => option.clientName}
              renderGroup={(params) => (
                <li key={params.key}>
                  <div style={{
                    backgroundColor: '#f5f5f5',
                    fontWeight: 'bold',
                    color: '#666',
                    padding: '8px 16px',
                    borderBottom: '1px solid #e0e0e0',
                    fontSize: '0.875rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    {params.group}
                  </div>
                  <ul style={{ padding: 0, margin: 0 }}>
                    {params.children}
                  </ul>
                </li>
              )}
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder="Search projects..."
                  size="small"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: 'white',
                      '&:hover': {
                        backgroundColor: '#f8f9fa'
                      }
                    }
                  }}
                />
              )}
              renderOption={(props, option) => (
                <Box component="li" {...props}>
                  {option.name}
                </Box>
              )}
              ListboxProps={{
                style: {
                  maxHeight: 300
                }
              }}
              noOptionsText="No projects found"
              clearOnEscape
              selectOnFocus
              handleHomeEndKeys
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Task *</label>
            <Autocomplete
              value={selectedTask}
              onChange={(event, newValue) => {
                setSelectedTask(newValue)
                if (newValue) {
                  localStorage.setItem('lastSelectedTaskId', newValue.id.toString())
                }
              }}
              inputValue={taskSearchTerm}
              onInputChange={(event, newInputValue) => {
                setTaskSearchTerm(newInputValue)
              }}
              options={selectedProject?.tasks || []}
              filterOptions={(options, { inputValue }) => {
                const filtered = options.filter(option => 
                  option.name.toLowerCase().includes(inputValue.toLowerCase())
                )
                return filtered
              }}
              getOptionLabel={(option) => option.name}
              groupBy={(option) => {
                console.log('Grouping task:', option.name, 'billable:', option.billable)
                return option.billable ? "Billable" : "Non-Billable"
              }}
              renderGroup={(params) => (
                <li key={params.key}>
                  <div style={{
                    backgroundColor: '#f5f5f5',
                    fontWeight: 'bold',
                    color: '#666',
                    padding: '8px 16px',
                    borderBottom: '1px solid #e0e0e0',
                    fontSize: '0.875rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    {params.group}
                  </div>
                  <ul style={{ padding: 0, margin: 0 }}>
                    {params.children}
                  </ul>
                </li>
              )}
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder="Search tasks..."
                  size="small"
                  disabled={!selectedProject}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: 'white',
                      '&:hover': {
                        backgroundColor: '#f8f9fa'
                      }
                    }
                  }}
                />
              )}
              renderOption={(props, option) => (
                <Box component="li" {...props}>
                  {option.name}
                </Box>
              )}
              ListboxProps={{
                style: {
                  maxHeight: 300
                }
              }}
              noOptionsText="No tasks found"
              clearOnEscape
              selectOnFocus
              handleHomeEndKeys
              disabled={!selectedProject}
            />
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