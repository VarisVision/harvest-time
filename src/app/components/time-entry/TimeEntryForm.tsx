"use client"

import React, { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import ProjectSelector from "./ProjectSelector"
import TaskSelector from "./TaskSelector"
import { Project, Task, ProjectAssignment } from "../types"

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
  const [date, setDate] = useState<string>("")
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedProject || !selectedTask || !hours || !date) {
      setError("Please fill in all required fields")
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      await onSubmit({
        project_id: selectedProject.id,
        task_id: selectedTask.id,
        hours: parseFloat(hours),
        spent_date: date,
        notes: message
      })

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
    <div className="w-full max-w-2xl mb-8">
      <h2 className="text-xl font-semibold mb-4">Create New Time Entry</h2>
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
          <label className="block text-sm font-medium mb-2">Message</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full p-2 border rounded text-black"
            rows={3}
            placeholder="Optional notes about this time entry"
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

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50 cursor-pointer"
        >
          {submitting ? "Saving..." : "Save Time Entry"}
        </button>
      </form>
    </div>
  )
}
