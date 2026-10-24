
import { useEffect, useState } from 'react'
import './App.css'

const API_URL = '/api/tasks'

interface Task {
  id: number
  title: string
  completed: boolean
}

type TaskFilter = 'all' | 'active' | 'completed'

function App() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [title, setTitle] = useState('')
  const [filter, setFilter] = useState<TaskFilter>('all')
  const [isLoading, setIsLoading] = useState(true)
  const [isAdding, setIsAdding] = useState(false)
  const [busyTaskId, setBusyTaskId] = useState<number | null>(null)
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

  const totalTasks = tasks.length
  const completedTasks = tasks.filter((task) => task.completed).length
  const remainingTasks = totalTasks - completedTasks
  const progress = totalTasks === 0
    ? 0
    : Math.round((completedTasks / totalTasks) * 100)

  const filteredTasks = tasks.filter((task) => {
    if (filter === 'active') return !task.completed
    if (filter === 'completed') return task.completed
    return true
  })

  async function addTask() {
    const trimmedTitle = title.trim()

    if (!trimmedTitle || isAdding) return

    setActionError('')
    setIsAdding(true)

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: trimmedTitle }),
      })

      if (!response.ok) {
        throw new Error('Failed to create task')
      }

      const newTask: Task = await response.json()

      setTasks((currentTasks) => [...currentTasks, newTask])
      setTitle('')
      setFilter('all')
    } catch (error) {
      console.error('Error creating task:', error)
      setActionError('Could not save the task. Please try again.')
    } finally {
      setIsAdding(false)
    }
  }

  async function toggleTask(id: number) {
    if (busyTaskId !== null) return

    const task = tasks.find((item) => item.id === id)
    if (!task) return

    setActionError('')
    setBusyTaskId(id)

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
        currentTasks.map((item) => item.id === id ? updatedTask : item),
      )
    } catch (error) {
      console.error('Error updating task:', error)
      setActionError('Could not update the task. Please try again.')
    } finally {
      setBusyTaskId(null)
    }
  }

  async function deleteTask(id: number) {
    if (busyTaskId !== null) return

    setActionError('')
    setBusyTaskId(id)

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
    } finally {
      setBusyTaskId(null)
    }
  }

  return (
    <main className="task-app">
      <header className="app-header">
        <p className="eyebrow">YOUR PERSONAL WORKSPACE</p>
        <h1>Personal Task Tracker</h1>
        <p>Organize your day, one task at a time.</p>
      </header>

      <section className="dashboard" aria-label="Task progress">
        <div className="stat-card">
          <span className="stat-label">Total tasks</span>
          <strong className="stat-value">{totalTasks}</strong>
        </div>

        <div className="stat-card">
          <span className="stat-label">Remaining</span>
          <strong className="stat-value">{remainingTasks}</strong>
        </div>

        <div className="stat-card">
          <span className="stat-label">Completed</span>
          <strong className="stat-value">{completedTasks}</strong>
        </div>

        <div className="progress-section">
          <div className="progress-heading">
            <span>Overall progress</span>
            <strong>{progress}%</strong>
          </div>

          <div
            className="progress-track"
            role="progressbar"
            aria-label="Task completion progress"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={progress}
          >
            <div
              className="progress-fill"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </section>

      <form
        className="task-form"
        onSubmit={(event) => {
          event.preventDefault()
          void addTask()
        }}
      >
        <input
          type="text"
          placeholder="What do you need to do?"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          aria-label="New task title"
          maxLength={200}
        />

        <button
          type="submit"
          disabled={!title.trim() || isAdding}
        >
          {isAdding ? 'Adding...' : 'Add task'}
        </button>
      </form>

      {actionError && (
        <p className="error-message" role="alert">
          {actionError}
        </p>
      )}

      <section className="task-section" aria-label="Your tasks">
        <div className="task-section-heading">
          <h2>Your tasks</h2>

          <div className="filter-buttons" aria-label="Filter tasks">
            <button
              type="button"
              className={filter === 'all' ? 'filter-button selected' : 'filter-button'}
              aria-pressed={filter === 'all'}
              onClick={() => setFilter('all')}
            >
              All ({totalTasks})
            </button>

            <button
              type="button"
              className={filter === 'active' ? 'filter-button selected' : 'filter-button'}
              aria-pressed={filter === 'active'}
              onClick={() => setFilter('active')}
            >
              Active ({remainingTasks})
            </button>

            <button
              type="button"
              className={filter === 'completed' ? 'filter-button selected' : 'filter-button'}
              aria-pressed={filter === 'completed'}
              onClick={() => setFilter('completed')}
            >
              Completed ({completedTasks})
            </button>
          </div>
        </div>

        {isLoading ? (
          <p className="empty-state">Loading tasks...</p>
        ) : error ? (
          <p className="error-message" role="alert">{error}</p>
        ) : filteredTasks.length === 0 ? (
          <p className="empty-state">
            {totalTasks === 0
              ? 'No tasks yet. Add your first task!'
              : filter === 'active'
                ? 'All caught up! There are no active tasks.'
                : filter === 'completed'
                  ? 'No completed tasks yet.'
                  : 'No tasks found.'}
          </p>
        ) : (
          <div className="task-list">
            {filteredTasks.map((task) => (
              <article className="task-item" key={task.id}>
                <label className="task-label">
                  <input
                    type="checkbox"
                    checked={task.completed}
                    disabled={busyTaskId !== null}
                    onChange={() => void toggleTask(task.id)}
                  />

                  <span className={task.completed ? 'completed' : ''}>
                    {task.title}
                  </span>
                </label>

                <button
                  type="button"
                  className="delete-button"
                  disabled={busyTaskId !== null}
                  onClick={() => void deleteTask(task.id)}
                  aria-label={`Delete ${task.title}`}
                >
                  {busyTaskId === task.id ? 'Please wait...' : 'Delete'}
                </button>
              </article>
            ))}
          </div>
        )}
      </section>

      <footer className="task-footer">
        {remainingTasks === 0 && totalTasks > 0
          ? 'All tasks completed — great work!'
          : `${remainingTasks} task(s) remaining`}
      </footer>
    </main>
  )
}

export default App
