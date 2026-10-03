import express from "express";
import cors from "cors";
import "dotenv/config";
const app = express();
app.use(cors());
import { pool } from "../database/pool.js";
const port = process.env.PORT;

app.get("/health", (_req, res) => {
  res.json({
    status: "OK",
  });
});
app.get("/db-check", async (_req, res) => {
  const result = await pool.query("SELECT NOW()");
  if (!result) {
    res.status(401).json({
      message: "Ponka",
    });
  } else {
    res.json({
      status: "connected",
      databaseTime: result.rows[0].now,
    });
  }
});

app.listen(port, () => {
  console.log(`The server is listening @: http://localhost/${port}`);
});
