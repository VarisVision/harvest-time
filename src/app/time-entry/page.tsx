"use client"

import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { logout } from "../utils/logout"
import { Select, MenuItem, ListSubheader, TextField, Box, FormControl } from "@mui/material"

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
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([])
  const [searchTerm, setSearchTerm] = useState<string>("")
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
    if (searchTerm.trim() === "") {
      setFilteredProjects(projects)
    } else {
      const filtered = projects.filter(project => 
        project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.clientName.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredProjects(filtered)
    }
  }, [searchTerm, projects])

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
            project.tasks.push({
              id: taskAssignment.task.id,
              name: taskAssignment.task.name
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

  const handleSearchInputClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleSearchInputFocus = (e: React.FocusEvent) => {
    e.preventDefault()
    e.stopPropagation()
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
             <FormControl fullWidth>
               <Select
                 value={selectedProject?.id || ""}
                 onChange={(e) => {
                   const projectId = e.target.value
                   const project = filteredProjects.find(p => p.id === projectId)
                   setSelectedProject(project || null)
                   if (project) {
                     localStorage.setItem('lastSelectedProjectId', project.id.toString())
                   }
                   setSelectedTask("")
                 }}
                 displayEmpty
                 MenuProps={{
                   PaperProps: {
                     style: {
                       maxHeight: 400
                     }
                   }
                 }}
               >
                                                     <MenuItem 
                    sx={{ 
                      p: 0, 
                      m: 0,
                      cursor: 'default',
                      '&:hover': { backgroundColor: 'transparent' },
                      pointerEvents: 'none'
                    }}
                  >
                                         <TextField
                       fullWidth
                       size="small"
                       placeholder="Search projects..."
                       value={searchTerm}
                       onChange={(e) => setSearchTerm(e.target.value)}
                       onClick={handleSearchInputClick}
                       onMouseDown={handleSearchInputClick}
                       onFocus={handleSearchInputFocus}
                                               sx={{
                          pointerEvents: 'auto',
                          '& .MuiOutlinedInput-root': {
                            backgroundColor: 'white',
                            '&:hover': {
                              backgroundColor: '#f8f9fa'
                            }
                          }
                        }}
                       InputProps={{
                         startAdornment: <Box sx={{ mr: 1, color: 'text.secondary' }}>🔍</Box>
                       }}
                     />
                  </MenuItem>
                 {(() => {
                   const grouped = filteredProjects.reduce((acc, project) => {
                     if (!acc[project.clientName]) {
                       acc[project.clientName] = []
                     }
                     acc[project.clientName].push(project)
                     return acc
                   }, {} as Record<string, Project[]>)
                   
                   return Object.entries(grouped).map(([clientName, projects]) => [
                     <ListSubheader key={`header-${clientName}`} sx={{ 
                       backgroundColor: '#f5f5f5',
                       fontWeight: 'bold',
                       color: 'text.secondary',
                       borderBottom: '1px solid #e0e0e0'
                     }}>
                       {clientName}
                     </ListSubheader>,
                     ...projects.map(project => (
                       <MenuItem key={project.id} value={project.id}>
                         {project.name}
                       </MenuItem>
                     ))
                   ])
                 })()}
               </Select>
             </FormControl>
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