import Router from "express";
import argon2 from "argon2";
import jwt from "jsonwebtoken"
import { pool } from "../../database/pool/pool.js";

export const signInRouter = Router();

signInRouter.post("/signin", async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (typeof email !== "string" || typeof password !== "string") {
      return res.status(400).json({
        message: "Please enter valid email & password.",
      });
    }
    if (email.trim() === "" || password.trim() === "") {
      return res.status(400).json({
        message: "Email and password cannot be empty",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const result = await pool.query(
      `
        SELECT
        id,
        name,
        email,
        hashed_password,
        role
        FROM users
        WHERE email = $1

        `,
      [normalizedEmail],
    );

    if (result.rows.length === 0) {
      return res.status(201).json({
        message: "Invalid username or password",
      });
    }

    const user = result.rows[0];

    const passwordsMatched = argon2.verify(user.hashed_password, password);
    if (!passwordsMatched)
      return res.status(401).json({
        message: "Invalid email or password",
      });

    const jwtSecret = process.env.JWT_SECRET
    if(!jwtSecret) {
      throw new Error("JWT_SECRET is missing value")
    }

    const token = jwt.sign(
      {
        sub: String(user.id),
        role: user.role
      },
      jwtSecret,
      {
        expiresIn: "15m"
      }
    )

    res.cookie("accessToken", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 15 * 60 * 1000,
      path: "/"
    })


    return res.status(200).json({
      message: "Sign In Sccessful.",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({
      message: `"Internal Error", ${error}`
    });
  }
});
