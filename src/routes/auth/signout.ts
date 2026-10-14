import { Router } from "express";
import { pool } from "../../database/pool/pool.js";
import crypto from "node:crypto";

export const signOutRouter = Router();

signOutRouter.post("/signout", async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (refreshToken) {
      const refreshTokenHashed = crypto
        .createHash("sha256")
        .update(refreshToken)
        .digest("hex");

      await pool.query(
        `
    DELETE from refresh_token
    WHERE token_hash = $1
    `,
        [refreshTokenHashed],
      );
    }

    res.clearCookie("accessToken", {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      path: "/",
    });

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      path: "/auth",
    });

    return res.status(200).json({
      message: "Signed out successfully.",
    });
  } catch (error) {
    console.error("Error: ", error);

    return res.status(400).json({
      message: "Internal Server Error.",
    });
  }
});
