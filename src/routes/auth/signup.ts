import { Router } from "express";
import argon2 from "argon2";
import { pool } from "../../database/pool/pool.js";

export const signUpRouter = Router();

signUpRouter.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (
      typeof name !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string") {
      return res.status(400).json({
        message: "Name, email & password are required.",
      });
    }

    if (name.trim() === "" || email.trim() === "" || password.trim() === "") {
      return res.status(400).json({
        message: "Name, email and password cannot be empty.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await pool.query(
      `
        SELECT id FROM users WHERE email = $1
        `,
      [normalizedEmail],
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        message: "An account with this email already exists.",
      });
    }

    const hashedPassword = await argon2.hash(password);

    const result = await pool.query(
      `INSERT INTO users (
        name,
        email,
        hashed_password
        )
        VALUES ($1, $2, $3)
        RETURNINg id, name, email, role
        `,
      [name.trim(), normalizedEmail, hashedPassword],
    );

    return res.status(201).json({
      message: "Account created successfully.",
      user: result.rows[0],
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
        message: "Internal server error",
        error_obj: error
    });
  }
});
