
import Database from "better-sqlite3";
import path from "node:path";

const databasePath = path.join(__dirname, "..", "tasks.db");

const db = new Database(databasePath);

// Enable foreign key enforcement.
db.pragma("foreign_keys = ON");

export default db;
