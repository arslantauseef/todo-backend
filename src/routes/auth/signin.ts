import Router from "express";
import argon2 from "argon2";
import jwt from "jsonwebtoken"
import crypto from "node:crypto"
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

    const passwordsMatched = await argon2.verify(user.hashed_password, password);
    if (!passwordsMatched)
      return res.status(401).json({
        message: "Invalid email or password",
      });

    const jwtSecret = process.env.JWT_SECRET
    if(!jwtSecret) {
      throw new Error("JWT_SECRET is missing value")
    }

    const accessToken = jwt.sign(
      {
        sub: String(user.id),
        role: user.role
      },
      jwtSecret,
      {
        expiresIn: "15m"
      }
    )

    const refreshToken = crypto.randomBytes(64).toString("hex")
    const refreshTokenHash = crypto.createHash("sha256").update(refreshToken).digest("hex")
    await pool.query(`
      INSERT INTO refresh_token (
      user_id,
      token_hash,
      expires_at
      )
      VALUES ($1, $2, NOW() + INTERVAL '7 DAYS')
      `, [
        user.id,
        refreshTokenHash
      ])

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 1 * 60 * 1000,
      path: "/"
    })
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/auth"
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
