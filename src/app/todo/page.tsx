"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

interface Todo {
  id: number
  text: string
  completed: boolean
  createdAt: Date
}

export default function TodoPage() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [newTodoText, setNewTodoText] = useState("")
  const router = useRouter()

  useEffect(() => {
    const savedTodos = localStorage.getItem('todos')
    if (savedTodos) {
      const parsedTodos = JSON.parse(savedTodos).map((todo: Omit<Todo, 'createdAt'> & { createdAt: string }) => ({
        ...todo,
        createdAt: new Date(todo.createdAt)
      }))
      setTodos(parsedTodos)
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('todos', JSON.stringify(todos))
  }, [todos])

  const addTodo = (e: React.FormEvent) => {
    e.preventDefault()
    if (newTodoText.trim()) {
      const newTodo: Todo = {
        id: Date.now(),
        text: newTodoText.trim(),
        completed: false,
        createdAt: new Date()
      }
      setTodos([...todos, newTodo])
      setNewTodoText("")
    }
  }

  const toggleTodo = (id: number) => {
    setTodos(todos.map(todo => 
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ))
  }

  const deleteTodo = (id: number) => {
    setTodos(todos.filter(todo => todo.id !== id))
  }

  const completedCount = todos.filter(todo => todo.completed).length
  const totalCount = todos.length

  return (
    <div className="flex flex-col justify-center min-h-screen w-full max-w-lg p-4 m-auto">
      <div className="flex flex-row justify-between mb-4">
        <h2 className="text-xl font-semibold">Todo List</h2>
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/time-entry')}
            className="text-blue-500 font-bold rounded hover:text-blue-600 cursor-pointer flex items-center gap-2"
          >
            Time Entry
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24">
              <path fill="currentColor" d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10s10-4.5 10-10S17.5 2 12 2m4.2 14.2L11 13V7h1.5v5.2l4.5 2.7z"/>
            </svg>
          </button>
        </div>
      </div>

      <div className="mb-4 p-3 bg-gray-100 rounded">
        <p className="text-sm text-gray-600">
          {completedCount} of {totalCount} tasks completed
        </p>
        {totalCount > 0 && (
          <div className="w-full bg-gray-300 rounded-full h-2 mt-2">
            <div 
              className="bg-green-500 h-2 rounded-full transition-all duration-300" 
              style={{ width: `${totalCount > 0 ? (completedCount / totalCount) * 100 : 0}%` }}
            ></div>
          </div>
        )}
      </div>

      <form onSubmit={addTodo} className="mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            value={newTodoText}
            onChange={(e) => setNewTodoText(e.target.value)}
            placeholder="Add a new task..."
            className="flex-1 p-2 border rounded text-black focus:outline-none focus:border-green-500"
          />
          <button
            type="submit"
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 font-medium"
          >
            Add
          </button>
        </div>
      </form>

      <div className="space-y-2">
        {todos.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No tasks yet. Add one above!</p>
        ) : (
          todos.map((todo) => (
            <div
              key={todo.id}
              className={`flex items-center gap-3 p-3 border rounded ${
                todo.completed ? 'bg-gray-50 border-gray-200' : 'bg-white border-gray-300'
              }`}
            >
              <input
                type="checkbox"
                checked={todo.completed}
                onChange={() => toggleTodo(todo.id)}
                className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
              />
              <span
                className={`flex-1 ${
                  todo.completed 
                    ? 'line-through text-gray-500' 
                    : 'text-gray-900'
                }`}
              >
                {todo.text}
              </span>
              <button
                onClick={() => deleteTodo(todo.id)}
                className="text-red-500 hover:text-red-700 p-1"
                aria-label="Delete task"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M7 21q-.825 0-1.412-.587T5 19V6H4V4h5V3h6v1h5v2h-1v13q0 .825-.587 1.413T17 21zM17 6H7v13h10zM9 17h2V8H9zm4 0h2V8h-2zM7 6v13z"/>
                </svg>
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}