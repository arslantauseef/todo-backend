import { Router } from "express";
import { pool } from "../../database/pool/pool.js";
import { requestAuth } from "../../middleware/require_auth/requireAuth.js";

export const todoPostRouter = Router();

todoPostRouter.post("/", requestAuth, async (req, res) => {
  try {
    const { title } = req.body;
    if (typeof title !== "string" || title.trim() === "") {
      return res.status(400).json({
        message: "Title's required",
      });
    }

    if (!req.auth) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const result = await pool.query(
      `
        INSERT INTO todos(
        user_id,
        title
        )

        VALUES ($1, $2)
        RETURNING *

        `,
      [req.auth?.userId, title.trim()],
    );

    return res.status(200).json({
      message: "Todo created succesfully",
      todo: result.rows[0],
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
});
