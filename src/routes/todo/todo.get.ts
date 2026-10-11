import { Router } from "express";
import { pool } from "../../database/pool/pool.js";
import { requestAuth } from "../../middleware/require_auth/requireAuth.js";

export const todoGetRouter = Router();

todoGetRouter.get("/", requestAuth, async (req, res) => {
  try {
    if (!req.auth) {
      return res.status(400).json({
        message: "unauthorized",
      });
    }

    const result = await pool.query(
      `
        SELECT * FROM todos
        WHERE user_id = $1
        ORDER BY created_at DESC
        `,
      [req.auth.userId],
    );

    return res.status(200).json({
      message: "Todos retrieved",
      todo: result.rows,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal error.",
    });
  }
});
