const express = require("express");
const app = express();
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

let db = null;

app.use(express.json());

//initialize server
let initialize = async () => {
  try {
    let dbPath = path.join(__dirname, "todoApplication.db");

    db = await open({ filename: dbPath, driver: sqlite3.Database });

    app.listen(3000, () => console.log("Server is Online"));
  } catch (e) {
    console.log(`DB Error : ${e.message}`);
    process.exit(1);
  }
};

initialize();

//API 1
app.get("/todos/", async (request, response) => {
  const { search_q = "", status = "", priority = "" } = request.query;

  const query = `SELECT * FROM todo 
    WHERE todo like '%${search_q}%' AND status like '%${status}%' AND priority like '%${priority}%'`;

  const result = await db.all(query);
  response.send(result);
});

//API 2
app.get("/todos/:todoId", async (request, response) => {
  const { todoId } = request.params;
  const query = `SELECT * FROM todo 
        WHERE id = ${todoId};`;

  const result = await db.get(query);
  response.send(result);
});

//API 3
app.post("/todos/", async (request, response) => {
  const { id, todo, priority, status } = request.body;

  const query = `INSERT INTO todo 
        (id,todo,priority,status) VALUES 
        ('${id}','${todo}','${priority}','${status}');`;

  await db.run(query);
  response.send("Todo Successfully Added");
});

//API 4
app.put("/todos/:todoId", async (request, response) => {
  const { todoId } = request.params;
  const existing = await db.get(`SELECT * FROM todo WHERE id = ${todoId}`);
  const {
    status = existing.status,
    priority = existing.priority,
    todo = existing.todo,
  } = request.body;

  const query = `UPDATE todo SET 
        todo = '${todo}', status = '${status}' ,priority = '${priority}' 
        WHERE id = ${todoId};`;
  const result = await db.run(query);

  let value;
  switch (false) {
    case status === existing.status:
      value = "Status";
      break;
    case priority === existing.priority:
      value = "Priority";
      break;
    case todo === existing.todo:
      value = "Todo";
      break;
  }

  response.send(`${value} Updated`);
});

//API 5
app.delete("/todos/:todoId", async (request, response) => {
  const { todoId } = request.params;
  const query = `DELETE FROM todo WHERE id = ${todoId};`;

  await db.run(query);
  response.send("Todo Deleted");
});

//module export
module.exports = app;
