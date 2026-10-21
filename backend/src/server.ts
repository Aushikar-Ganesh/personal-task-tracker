
import express from "express";

const app = express();
const PORT = 3000;

// Allow Express to understand JSON request bodies.
app.use(express.json());

// Temporary sample tasks.
// Later, we will store these in SQLite.
const tasks = [
  {
    id: 1,
    title: "Learn Node.js",
    completed: false,
  },
  {
    id: 2,
    title: "Build my first API",
    completed: true,
  },
];

// Welcome route
app.get("/", (_req, res) => {
  res.json({
    message: "Personal Task Tracker API is running!",
  });
});

// Get all tasks
app.get("/api/tasks", (_req, res) => {
  res.json(tasks);
});


 // Create a new task
app.post("/api/tasks", (req, res) => {
  const { title } = req.body;

  // Validate the task title.
  if (typeof title !== "string" || title.trim() === "") {
    return res.status(400).json({
      error: "Task title is required.",
    });
  }

  const newTask = {
    id: tasks.length > 0
      ? Math.max(...tasks.map((task) => task.id)) + 1
      : 1,
    title: title.trim(),
    completed: false,
  };

  tasks.push(newTask);

  return res.status(201).json(newTask);
});

app.put("/api/tasks/:id", (req, res) => {
  const id = Number(req.params.id);
  const { completed } = req.body;

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({
      error: "Invalid task ID.",
    });
  }

  if (typeof completed !== "boolean") {
    return res.status(400).json({
      error: "Completed must be true or false.",
    });
  }

  const task = tasks.find((task) => task.id === id);

  if (!task) {
    return res.status(404).json({
      error: "Task not found.",
    });
  }

  task.completed = completed;

  return res.json(task);
});


app.delete("/api/tasks/:id", (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({
      error: "Invalid task ID.",
    });
  }

  const taskIndex = tasks.findIndex((task) => task.id === id);

  if (taskIndex === -1) {
    return res.status(404).json({
      error: "Task not found.",
    });
  }

  tasks.splice(taskIndex, 1);

  return res.status(204).send();
});


app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
