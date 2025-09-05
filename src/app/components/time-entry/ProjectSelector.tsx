"use client"

import React, { useMemo } from "react"
import { 
  FormControl, 
  Select, 
  MenuItem, 
  ListSubheader, 
  TextField, 
  InputAdornment 
} from "@mui/material"
import { Project } from "../types"

interface ProjectSelectorProps {
  projects: Project[]
  selectedProject: Project | null
  searchTerm: string
  onProjectChange: (project: Project | null) => void
  onSearchChange: (searchTerm: string) => void
}

const containsText = (text: string, searchText: string) =>
  text.toLowerCase().indexOf(searchText.toLowerCase()) > -1

export default function ProjectSelector({
  projects,
  selectedProject,
  searchTerm,
  onProjectChange,
  onSearchChange
}: ProjectSelectorProps) {
  const displayedProjects = useMemo(() => {
    if (!searchTerm) return projects
    
    return projects.filter(project => 
      containsText(project.name, searchTerm) || 
      containsText(project.clientName, searchTerm)
    )
  }, [projects, searchTerm])

  const groupedProjects = useMemo(() => {
    const grouped = displayedProjects.reduce((acc, project) => {
      if (!acc[project.clientName]) {
        acc[project.clientName] = []
      }
      acc[project.clientName].push(project)
      return acc
    }, {} as Record<string, Project[]>)
    
    return Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b))
  }, [displayedProjects])

  return (
    <div>
      <label className="block text-sm font-medium mb-2">Project *</label>
      <FormControl fullWidth>
        <Select
          MenuProps={{ 
            autoFocus: false,
            PaperProps: {
              style: {
                maxHeight: 300
              }
            }
          }}
          sx={{
            '& .MuiInputBase-input': {
              padding: '10px 2rem .5rem 1rem',
            }
          }}
          value={selectedProject?.id || ""}
          onChange={(e) => {
            const projectId = e.target.value
            const project = projects.find(p => p.id === projectId)
            onProjectChange(project || null)
          }}
          onClose={() => onSearchChange("")}
          renderValue={() => selectedProject ? (
            <div className="flex flex-col items-start">
              <div className="text-xs font-bold text-gray-600">
                {selectedProject.clientName}
              </div>
              <div className="text-sm">
                {selectedProject.name}
              </div>
            </div>
          ) : ""}
          displayEmpty
        >
          <ListSubheader>
            <TextField
              size="small"
              autoFocus
              placeholder="Type to search..."
              fullWidth
              value={searchTerm}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    🔍
                  </InputAdornment>
                )
              }}
              onChange={(e) => onSearchChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key !== "Escape") {
                  e.stopPropagation()
                }
              }}
            />
          </ListSubheader>
          {groupedProjects.map(([clientName, clientProjects]) => [
            <ListSubheader key={`header-${clientName}`} sx={{ 
              backgroundColor: '#f5f5f5',
              fontWeight: 'bold',
              color: '#666',
              borderBottom: '1px solid #e0e0e0',
              fontSize: '0.875rem',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              {clientName}
            </ListSubheader>,
            ...clientProjects.map(project => (
              <MenuItem key={project.id} value={project.id} className="text-sm">
                {project.name}
              </MenuItem>
            ))
          ])}
        </Select>
      </FormControl>
    </div>
  )
}
