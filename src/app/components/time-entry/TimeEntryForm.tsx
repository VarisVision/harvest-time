"use client"

import React, { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { DatePicker } from "@mui/x-date-pickers/DatePicker"
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider"
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns"
import { SvgIcon } from "@mui/material"
import ProjectSelector from "./ProjectSelector"
import TaskSelector from "./TaskSelector"
import { Project, Task, ProjectAssignment } from "../types"

const CustomCalendarIcon = (props) => (
  <SvgIcon {...props}>
    <g fill="none">
      <path stroke="currentColor" strokeWidth="1.5" d="M2 12c0-3.771 0-5.657 1.172-6.828S6.229 4 10 4h4c3.771 0 5.657 0 6.828 1.172S22 8.229 22 12v2c0 3.771 0 5.657-1.172 6.828S17.771 22 14 22h-4c-3.771 0-5.657 0-6.828-1.172S2 17.771 2 14z" />
      <path stroke="currentColor" strokeLinecap="round" strokeWidth="1.5" d="M7 4V2.5M17 4V2.5M2.5 9h19" />
      <path fill="currentColor" d="M18 17a1 1 0 1 1-2 0a1 1 0 0 1 2 0m0-4a1 1 0 1 1-2 0a1 1 0 0 1 2 0m-5 4a1 1 0 1 1-2 0a1 1 0 0 1 2 0m0-4a1 1 0 1 1-2 0a1 1 0 0 1 2 0m-5 4a1 1 0 1 1-2 0a1 1 0 0 1 2 0m0-4a1 1 0 1 1-2 0a1 1 0 0 1 2 0" />
    </g>
  </SvgIcon>
);

interface TimeEntryFormProps {
  onSubmit: (data: {
    project_id: number
    task_id: number
    hours: number
    spent_date: string
    notes: string
  }) => Promise<void>
}

export default function TimeEntryForm({ onSubmit }: TimeEntryFormProps) {
  const [projects, setProjects] = useState<Project[]>([])
  const [searchTerm, setSearchTerm] = useState<string>("")
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [taskSearchTerm, setTaskSearchTerm] = useState<string>("")
  const [hours, setHours] = useState<string>("")
  const [date, setDate] = useState<Date | null>(new Date())
  const [message, setMessage] = useState<string>("")
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
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

  const fetchData = useCallback(async () => {
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
  }, [router])

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
  }, [fetchData])

  const convertTimeToDecimal = (timeStr: string): number => {
    if (!timeStr.includes(':')) {
      return parseFloat(timeStr) || 0
    }
    
    const parts = timeStr.split(':')
    if (parts.length === 2) {
      const hours = parseInt(parts[0]) || 0
      const minutes = parseInt(parts[1]) || 0
      return hours + (minutes / 60)
    }
    
    return 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedProject || !selectedTask || !hours || !date) {
      setError("Please fill in all required fields")
      return
    }

    const decimalHours = convertTimeToDecimal(hours)
    if (decimalHours <= 0) {
      setError("Please enter a valid time (e.g., 1:30, 0:45, 2.5)")
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      await onSubmit({
        project_id: selectedProject.id,
        task_id: selectedTask.id,
        hours: decimalHours,
        spent_date: date.toISOString().split('T')[0],
        notes: message
      })

      setSelectedProject(null)
      setSelectedTask(null)
      setHours("")
      setDate(new Date())
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

  const handleProjectChange = (project: Project | null) => {
    setSelectedProject(project)
    if (project) {
      localStorage.setItem('lastSelectedProjectId', project.id.toString())
    }
    setSelectedTask(null)
    setTaskSearchTerm("")
  }

  const handleTaskChange = (task: Task | null) => {
    setSelectedTask(task)
    if (task) {
      localStorage.setItem('lastSelectedTaskId', task.id.toString())
    }
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
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <div className="mb-8 png-time-entry">
        <form onSubmit={handleSubmit} className="space-y-4">
        <ProjectSelector
          projects={projects}
          selectedProject={selectedProject}
          searchTerm={searchTerm}
          onProjectChange={handleProjectChange}
          onSearchChange={setSearchTerm}
        />

        <TaskSelector
          tasks={selectedProject?.tasks || []}
          selectedTask={selectedTask}
          searchTerm={taskSearchTerm}
          onTaskChange={handleTaskChange}
          onSearchChange={setTaskSearchTerm}
          disabled={!selectedProject}
        />

        <div>
            <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full p-2 border rounded text-black"
                rows={3}
                placeholder="Optional notes about this time entry"
            />
        </div>

        <div className="flex flex-row gap-4">
            <div>
                <label className="hidden text-sm font-medium mb-2">Hours *</label>
                <input
                    type="text"
                    value={hours}
                    onChange={(e) => setHours(e.target.value)}
                    className="w-full p-2 border rounded text-black time-input"
                    placeholder="0:00"
                    required
                />
            </div>

            <div>
                <label className="hidden text-sm font-medium mb-2">Date *</label>
                <DatePicker
                    value={date}
                    onChange={(newValue) => setDate(newValue)}
                    format="d MMM yy'"
                    slots={{
                        openPickerIcon: CustomCalendarIcon,
                    }}
                    slotProps={{
                        textField: {
                            fullWidth: true,
                            size: 'small',
                        },
                        actionBar: {
                            actions: ['today', 'cancel']
                        }
                    }}
                />
            </div>

            <button
                type="submit"
                disabled={submitting}
                className="w-full bg-green-600 text-white font-bold px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50 cursor-pointer"
                >
                {submitting ? "Saving..." : "Save Time Entry"}
            </button>
        </div>
      </form>
    </div>
    </LocalizationProvider>
  )
}
