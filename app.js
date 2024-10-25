const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const cors = require("cors"); // Import cors

const app = express();
const dbPath = path.join(__dirname, "culter.db");

let db = null;

app.use(cors()); // Enable CORS
app.use(express.json()); 

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(5000, () => {
      console.log("Server Running at http://localhost:5000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

app.get("/tasks", async (request, response) => {
  const allTasksQuery = `SELECT * FROM tasks;`;
  const allTasks = await db.all(allTasksQuery);
  response.send(allTasks);
});

app.post("/tasks", async (request, response) => {
  const taskDetails = request.body;
  const { title, completed = false } = taskDetails;

  const addTaskQuery = `
    INSERT INTO tasks (title, completed)
    VALUES (?, ?);
  `;

  const dbResponse = await db.run(addTaskQuery, title, completed);
  const taskId = dbResponse.lastID; // Get the ID of the newly inserted task
  response.send({ taskId: taskId });
});

app.put("/tasks/:id", async (request, response) => {
  const { id } = request.params;
  const taskDetails = request.body;
  const { title, completed } = taskDetails;

  const updateTaskQuery = `
    UPDATE tasks
    SET title = ?, completed = ?
    WHERE id = ?;
  `;

  await db.run(updateTaskQuery, title, completed, id);
  response.send({ message: "Task updated successfully" });
});

app.delete("/tasks/:id", async (request, response) => {
  const { id } = request.params;

  const deleteTaskQuery = `
    DELETE FROM tasks
    WHERE id = ?;
  `;

  await db.run(deleteTaskQuery, id);
  response.send({ message: "Task deleted successfully" });
});
