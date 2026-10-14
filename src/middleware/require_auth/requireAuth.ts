import jwt, { type JwtPayload } from "jsonwebtoken";
import type { Request, Response, NextFunction } from "express";

type AuthTokenPayload = {
  sub: string;
  role: "Admin" | "Moderator" | "User";
};

export const requestAuth = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const token = req.cookies.accessToken;

  if (!token) {
    return res.status(401).json({
      message: "Unauthorized.",
    });
  }

  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret) {
    throw new Error("JWT Token is missing");
  }

  try {
    const decoded = jwt.verify(token, jwtSecret) as AuthTokenPayload;

    if (
      typeof decoded.sub !== "string" ||
      !["User", "Moderator", "Admin"].includes(decoded.role)
    ) {
      return res.status(401).json({
        message: "Invalid Token",
      });
    }

    req.auth = {
      userId: decoded.sub,
      role: decoded.role,
    };

    next();
  } catch (error) {
    res.status(400).json({
      message: `Internal Error: ${error}`,
    });
  }
};
