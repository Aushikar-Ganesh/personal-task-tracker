
import db from "./database";

db.exec(`
  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    completed INTEGER NOT NULL DEFAULT 0
      CHECK (completed IN (0, 1))
  );
`);

console.log("Tasks table created successfully!");

db.close();
