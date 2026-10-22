import Database from "better-sqlite3";
import path from "node:path";

const databasePath =
  process.env.DATABASE_PATH ??
  path.join(__dirname, "..", "tasks.db");

const db = new Database(databasePath);

db.pragma("foreign_keys = ON");

db.exec(`
  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    completed INTEGER NOT NULL DEFAULT 0
      CHECK (completed IN (0, 1))
  );
`);

export default db;