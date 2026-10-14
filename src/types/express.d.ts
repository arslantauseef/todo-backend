export {};

declare global {
  namespace Express {
    interface Request {
      auth?: {
        userId: string,
        role: "Admin" | "Moderator" | "User"
      };
    }
  }
}
