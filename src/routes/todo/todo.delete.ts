import { Router } from "express";
import { requestAuth } from "../../middleware/require_auth/requireAuth.js";
import { pool } from "../../database/pool/pool.js";

export const todoDeleteRouter = Router();


todoDeleteRouter.delete("/:id", requestAuth, async (req, res) => {
  try {
    if (!req.auth) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const { id } = req.params;
    const result = await pool.query(
      `
      DELETE FROM todos
      WHERE id = $1
      AND user_id = $2
      RETURNING *
        `,
      [id, req.auth?.userId],
    );

    if (result.rows.length === 0) {
      return res.status(400).json({
        message: "Todos not found",
      });
    }

    return res.status(200).json({
      message: "Todo has been deleted",
      todo: result.rows[0],
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Internal server error.",
    });
  }
});
