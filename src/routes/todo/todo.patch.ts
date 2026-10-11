import { Router } from "express";
import { requestAuth } from "../../middleware/require_auth/requireAuth.js";
import { pool } from "../../database/pool/pool.js";

export const todoPatchRouter = Router();

todoPatchRouter.patch("/:id", requestAuth, async (req, res) => {
  try {
    if (!req.auth) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const { id } = req.params;
    const { title, completed } = req.body;

    if (title === undefined && completed === undefined) {
      return res.status(400).json({
        message: "Nothing to update",
      });
    }

    const result = await pool.query(
      `
        UPDATE todos
        SET 
            title = COALESCE($1, title),
            completed = COALESCE($2, completed),
            updated_at = NOW()
        WHERE id = $3
        AND user_id = $4
        RETURNING *
        `,
      [title ?? null, completed ?? null, id, req.auth?.userId],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Nothing to update",
      });
    }

    return res.status(200).json({
      message: "Todo updated successfully.",
      todo: result.rows[0],
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Internal server error.",
    });
  }
});
