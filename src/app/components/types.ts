export type ProjectAssignment = {
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

export type Project = {
  id: number
  name: string
  clientName: string
  tasks: Array<{
    id: number
    name: string
    billable: boolean
  }>
}

export type Task = {
  id: number
  name: string
  billable: boolean
}
