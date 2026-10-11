import express from "express";
import cors from "cors";
import "dotenv/config";
const app = express();
import cookieParser from "cookie-parser";
app.use(express.json());
app.use(cors());
app.use(cookieParser());
import { pool } from "../database/pool/pool.js";
import { signUpRouter } from "../routes/auth/signup.js";
import { signInRouter } from "../routes/auth/signin.js";
import { requestAuth } from "../middleware/require_auth/requireAuth.js";
import { todoPostRouter } from "../routes/todo/todo.post.js";
import { todoGetRouter } from "../routes/todo/todo.get.js";
import { todoPatchRouter } from "../routes/todo/todo.patch.js";
import { todoDeleteRouter } from "../routes/todo/todo.delete.js";
app.use("/auth", signUpRouter);
app.use("/auth", signInRouter);
app.use("/todos", todoPostRouter);
app.use("/todos", todoPatchRouter);
app.use("/todos", todoDeleteRouter);
app.use("/get-todos", todoGetRouter);
const port = process.env.PORT;

app.get("/protected-test", requestAuth, (req, res) => {
  res.json({
    authenticated: true,
    auth: req.auth,
  });
});

app.get("/database-checker", async (_req, res) => {
  const result = await pool.query(
    `  SELECT column_name, data_type
       FROM information_schema.columns
       WHERE table_name = 'users'
       ORDER BY ordinal_position`,
  );
  if (!result) {
    res.status(401).json({
      message: "Ponka",
    });
  } else {
    res.json({
      status: "connected",
      databaseTime: result.rows ?? [],
    });
  }
});

app.listen(port, () => {
  console.log(
    {
      "Port": `${port}`,
      "Server": `http://localhost:3000/`,
      "Database": `http://localhost:3000/database-checker`
    }
  );
});
