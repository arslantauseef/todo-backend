import { Router } from "express";
import { pool } from "../../database/pool/pool.js";

export const signOutRouter = Router();

signOutRouter.post("/signout", (req, res) => {
  res.clearCookie("accessToken", {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    path: "/",
  });

  return res.status(200).json({
    message: "Signed out successfully.",
  });
});
