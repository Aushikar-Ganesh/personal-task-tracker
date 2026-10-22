
import express from "express";
import db from "./database";

const app = express();
const PORT = 3000;

app.use(express.json());

interface Task {
  id: number;
  title: string;
  completed: boolean;
}

interface TaskRow {
  id: number;
  title: string;
  completed: number;
}

function formatTask(row: TaskRow): Task {
  return {
    id: row.id,
    title: row.title,
    completed: row.completed === 1,
  };
}

// Welcome route
app.get("/", (_req, res) => {
  res.json({
    message: "Personal Task Tracker API is running!",
  });
});

// Read all tasks
app.get("/api/tasks", (_req, res) => {
  const rows = db
    .prepare("SELECT id, title, completed FROM tasks ORDER BY id")
    .all() as TaskRow[];

  res.json(rows.map(formatTask));
});

// Create a task
app.post("/api/tasks", (req, res) => {
  const { title } = req.body;

  if (typeof title !== "string" || title.trim() === "") {
    return res.status(400).json({
      error: "Task title is required.",
    });
  }

  const result = db
    .prepare("INSERT INTO tasks (title) VALUES (?)")
    .run(title.trim());

  const row = db
    .prepare("SELECT id, title, completed FROM tasks WHERE id = ?")
    .get(result.lastInsertRowid) as TaskRow;

  return res.status(201).json(formatTask(row));
});

// Update a task
app.put("/api/tasks/:id", (req, res) => {
  const id = Number(req.params.id);
  const { completed } = req.body;

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ error: "Invalid task ID." });
  }

  if (typeof completed !== "boolean") {
    return res.status(400).json({
      error: "Completed must be true or false.",
    });
  }

  const result = db
    .prepare("UPDATE tasks SET completed = ? WHERE id = ?")
    .run(completed ? 1 : 0, id);

  if (result.changes === 0) {
    return res.status(404).json({ error: "Task not found." });
  }

  const row = db
    .prepare("SELECT id, title, completed FROM tasks WHERE id = ?")
    .get(id) as TaskRow;

  return res.json(formatTask(row));
});

// Delete a task
app.delete("/api/tasks/:id", (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ error: "Invalid task ID." });
  }

  const result = db
    .prepare("DELETE FROM tasks WHERE id = ?")
    .run(id);

  if (result.changes === 0) {
    return res.status(404).json({ error: "Task not found." });
  }

  return res.status(204).send();
});

export default app;