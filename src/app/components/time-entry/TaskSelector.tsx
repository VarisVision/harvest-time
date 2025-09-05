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
import { Task } from "../types"

interface TaskSelectorProps {
  tasks: Task[]
  selectedTask: Task | null
  searchTerm: string
  onTaskChange: (task: Task | null) => void
  onSearchChange: (searchTerm: string) => void
  disabled?: boolean
}

const containsText = (text: string, searchText: string) =>
  text.toLowerCase().indexOf(searchText.toLowerCase()) > -1

export default function TaskSelector({
  tasks,
  selectedTask,
  searchTerm,
  onTaskChange,
  onSearchChange,
  disabled = false
}: TaskSelectorProps) {
  const displayedTasks = useMemo(() => {
    if (!searchTerm) return tasks
    
    return tasks.filter(task => 
      containsText(task.name, searchTerm)
    )
  }, [tasks, searchTerm])

  const groupedTasks = useMemo(() => {
    const billableTasks = displayedTasks.filter(task => task.billable)
    const nonBillableTasks = displayedTasks.filter(task => !task.billable)
    
    return [
      { group: "Billable", tasks: billableTasks },
      { group: "Non-Billable", tasks: nonBillableTasks }
    ].filter(group => group.tasks.length > 0)
  }, [displayedTasks])

  return (
    <div>
      <label className="block text-sm font-medium mb-2">Task *</label>
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
              padding: '.5rem 2rem .5rem 1rem',
            }
          }}
          value={selectedTask?.id || ""}
          onChange={(e) => {
            const taskId = e.target.value
            const task = tasks.find(t => t.id === taskId)
            onTaskChange(task || null)
          }}
          onClose={() => onSearchChange("")}
          renderValue={() => selectedTask ? selectedTask.name : ""}
          displayEmpty
          disabled={disabled}
        >
          <ListSubheader>
            <TextField
              size="small"
              autoFocus
              placeholder="Type to search..."
              fullWidth
              value={searchTerm}
              disabled={disabled}
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
          {groupedTasks.map(({ group, tasks: groupTasks }) => [
            <ListSubheader key={`header-${group}`} sx={{ 
              backgroundColor: '#f5f5f5',
              fontWeight: 'bold',
              color: '#666',
              borderBottom: '1px solid #e0e0e0',
              fontSize: '0.875rem',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              {group}
            </ListSubheader>,
            ...groupTasks.map(task => (
              <MenuItem key={task.id} value={task.id}>
                {task.name}
              </MenuItem>
            ))
          ])}
        </Select>
      </FormControl>
    </div>
  )
}
