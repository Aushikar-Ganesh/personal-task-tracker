
import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import request from "supertest";
import type { Express } from "express";
import path from "node:path";
import fs from "node:fs";

const testDatabasePath = path.join(__dirname, "..", "test-tasks.db");

let app: Express;
let db: import("better-sqlite3").Database;

beforeAll(async () => {
  process.env.DATABASE_PATH = testDatabasePath;

  vi.resetModules();

  const appModule = await import("./server");
  const databaseModule = await import("./database");

  app = appModule.default;
  db = databaseModule.default;
});

beforeEach(() => {
  db.prepare("DELETE FROM tasks").run();
});

afterAll(() => {
  if (db) {
    db.close();
  }

  for (const suffix of ["", "-shm", "-wal"]) {
    fs.rmSync(testDatabasePath + suffix, { force: true });
  }

  delete process.env.DATABASE_PATH;
});

describe("Personal Task Tracker API", () => {
  it("returns an empty list when there are no tasks", async () => {
    const response = await request(app).get("/api/tasks");

    expect(response.status).toBe(200);
    expect(response.body).toEqual([]);
    
  });
  
  it("marks a task as completed", async () => {
    const createResponse = await request(app)
      .post("/api/tasks")
      .send({ title: "Test task update" });

    const taskId = createResponse.body.id;

    const updateResponse = await request(app)
      .put(`/api/tasks/${taskId}`)
      .send({ completed: true });

    expect(updateResponse.status).toBe(200);
    expect(updateResponse.body.completed).toBe(true);
  });

  it("deletes a task successfully", async () => {
    const createResponse = await request(app)
      .post("/api/tasks")
      .send({ title: "Test task deletion" });

    const taskId = createResponse.body.id;

    const deleteResponse = await request(app)
      .delete(`/api/tasks/${taskId}`);

    expect(deleteResponse.status).toBe(204);

    const listResponse = await request(app).get("/api/tasks");

    expect(listResponse.body).toEqual([]);
  });

  it("returns 404 when updating a nonexistent task", async () => {
    const response = await request(app)
      .put("/api/tasks/999999")
      .send({ completed: true });

    expect(response.status).toBe(404);
  });


  it("creates a task successfully", async () => {
    const response = await request(app)
      .post("/api/tasks")
      .send({ title: "Learn automated testing" });

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({
      id: expect.any(Number),
      title: "Learn automated testing",
      completed: false,
    });
  });

  it("rejects a task with a blank title", async () => {
    const response = await request(app)
      .post("/api/tasks")
      .send({ title: "   " });

    expect(response.status).toBe(400);
  });
});
