
import { useEffect, useState } from 'react'
import './App.css'

const API_URL = 'http://localhost:3000/api/tasks'

interface Task {
  id: number
  title: string
  completed: boolean
}

function App() {
const [tasks, setTasks] = useState<Task[]>([])
const [title, setTitle] = useState('')
const [isLoading, setIsLoading] = useState(true)
const [error, setError] = useState('')
const [actionError, setActionError] = useState('')
  

useEffect(() => {
  async function loadTasks() {
    try {
      setIsLoading(true)
      setError('')

      const response = await fetch(API_URL)

      if (!response.ok) {
        throw new Error('Failed to load tasks')
      }

      const data: Task[] = await response.json()
      setTasks(data)
    } catch (error) {
      console.error('Error loading tasks:', error)
      setError('Could not load tasks. Check that the backend is running.')
    } finally {
      setIsLoading(false)
    }
  }

  loadTasks()
}, [])



  
async function addTask() {
  setActionError('')
  const trimmedTitle = title.trim()

  if (!trimmedTitle) return

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ title: trimmedTitle }),
    })

    if (!response.ok) {
      throw new Error('Failed to create task')
    }

    const newTask: Task = await response.json()

    setTasks((currentTasks) => [...currentTasks, newTask])
    setTitle('')
  } catch (error) {
  console.error('Error creating task:', error)
  setActionError('Could not save the task. Please try again.')
}
}


  
async function toggleTask(id: number) {
  setActionError('')

  const task = tasks.find((task) => task.id === id)
  if (!task) return

  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completed: !task.completed }),
    })

    if (!response.ok) {
      throw new Error('Failed to update task')
    }

    const updatedTask: Task = await response.json()

    setTasks((currentTasks) =>
      currentTasks.map((currentTask) =>
        currentTask.id === id ? updatedTask : currentTask,
      ),
    )
  } catch (error) {
    console.error('Error updating task:', error)
    setActionError('Could not update the task. Please try again.')
  }
}


  
async function deleteTask(id: number) {
  setActionError('')

  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE',
    })

    if (!response.ok) {
      throw new Error('Failed to delete task')
    }

    setTasks((currentTasks) =>
      currentTasks.filter((task) => task.id !== id),
    )
  } catch (error) {
    console.error('Error deleting task:', error)
    setActionError('Could not delete the task. Please try again.')
  }
}


  return (
    <main className="task-app">
      <header>
        <h1>Personal Task Tracker</h1>
        <p>Organize your day, one task at a time.</p>
      </header>

      <form
        className="task-form"
        onSubmit={(event) => {
          event.preventDefault()
          addTask()
        }}
      >
        <input
          type="text"
          placeholder="What do you need to do?"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          aria-label="New task title"
        />
        <button type="submit">Add task</button>
      </form>
      {actionError && (
  <p className="error-message" role="alert">
    {actionError}
  </p>
)}
      
<section className="task-list" aria-label="Your tasks">
  {isLoading ? (
    <p className="empty-state">Loading tasks...</p>
  ) : error ? (
    <p className="error-message" role="alert">{error}</p>
  ) : tasks.length === 0 ? (
    <p className="empty-state">No tasks yet. Add your first task!</p>
  ) : (
    tasks.map((task) => (
      <article className="task-item" key={task.id}>
        <label>
          <input
            type="checkbox"
            checked={task.completed}
            onChange={() => toggleTask(task.id)}
          />
          <span className={task.completed ? 'completed' : ''}>
            {task.title}
          </span>
        </label>

        <button
          type="button"
          className="delete-button"
          onClick={() => deleteTask(task.id)}
          aria-label={`Delete ${task.title}`}
        >
          Delete
        </button>
      </article>
    ))
  )}
</section>


      <footer>
        {tasks.filter((task) => !task.completed).length} task(s) remaining
      </footer>
    </main>
  )
}

export default App
