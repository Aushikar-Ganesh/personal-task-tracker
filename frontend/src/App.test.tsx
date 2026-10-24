
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from './App'

interface Task {
  id: number
  title: string
  completed: boolean
}

const API_URL = 'http://localhost:3000/api/tasks'

function response(data: unknown, ok = true, status = 200) {
  return {
    ok,
    status,
    json: async () => data,
  } as Response
}

describe('Personal Task Tracker', () => {
  let fetchMock: ReturnType<typeof vi.fn>

  beforeEach(() => {
    fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
  })

  afterEach(() => {
    cleanup()
    vi.unstubAllGlobals()
  })

  it('loads and displays existing tasks', async () => {
    const tasks: Task[] = [
      { id: 1, title: 'Learn Docker', completed: false },
    ]

    fetchMock.mockResolvedValueOnce(response(tasks))

    render(<App />)

    expect(await screen.findByText('Learn Docker')).toBeInTheDocument()
    expect(fetchMock).toHaveBeenCalledWith(API_URL)
  })

  it('adds a new task', async () => {
    const user = userEvent.setup()

    fetchMock
      .mockResolvedValueOnce(response([]))
      .mockResolvedValueOnce(
        response({ id: 2, title: 'Learn Kubernetes', completed: false }, true, 201),
      )

    render(<App />)

    await user.type(
      screen.getByRole('textbox', { name: /new task title/i }),
      'Learn Kubernetes',
    )

    await user.click(screen.getByRole('button', { name: /add task/i }))

    expect(
      await screen.findByText('Learn Kubernetes'),
    ).toBeInTheDocument()

    expect(fetchMock).toHaveBeenLastCalledWith(
      API_URL,
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ title: 'Learn Kubernetes' }),
      }),
    )
  })

  it('marks a task as completed', async () => {
    const user = userEvent.setup()

    fetchMock
      .mockResolvedValueOnce(
        response([{ id: 1, title: 'Learn Git', completed: false }]),
      )
      .mockResolvedValueOnce(
        response({ id: 1, title: 'Learn Git', completed: true }),
      )

    render(<App />)

    const checkbox = await screen.findByRole('checkbox')

    await user.click(checkbox)

    await waitFor(() => {
      expect(checkbox).toBeChecked()
    })

    expect(fetchMock).toHaveBeenLastCalledWith(
      `${API_URL}/1`,
      expect.objectContaining({
        method: 'PUT',
        body: JSON.stringify({ completed: true }),
      }),
    )
  })

  it('deletes a task', async () => {
    const user = userEvent.setup()

    fetchMock
      .mockResolvedValueOnce(
        response([{ id: 1, title: 'Old task', completed: false }]),
      )
      .mockResolvedValueOnce(response(null, true, 204))

    render(<App />)

    expect(await screen.findByText('Old task')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Delete Old task' }))

    await waitFor(() => {
      expect(screen.queryByText('Old task')).not.toBeInTheDocument()
    })

    expect(fetchMock).toHaveBeenLastCalledWith(
      `${API_URL}/1`,
      expect.objectContaining({ method: 'DELETE' }),
    )
  })
})
