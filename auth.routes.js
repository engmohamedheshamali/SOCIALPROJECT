import express from "express";
import { checkAuth } from "../middleware/checkAuth.js";
import { validateBody } from "../middleware/validateBody.js";
import { createSession, getCurrentUserFromSession, loginUser, logoutUser, registerUser } from "../queries/auth.queries.js";
import { memoryDb } from "../db/index.js";
import { registerSchema, loginSchema } from "../validation-schemas/auth.js";

export const authRouter = express.Router();

authRouter.post("/register", validateBody(registerSchema), async (req, res) => {
  try {
    const result = await registerUser(req.body);
    return res.status(201).json(result);
  } catch (error) {
    if (error?.errors) {
      return res.status(422).json({ errors: error.errors });
    }

    return res.status(500).json({ error: "something went wrong" });
  }
});

authRouter.post("/login", validateBody(loginSchema), async (req, res) => {
  const user = await loginUser(req.body);
  if (!user) {
    return res.status(401).json({ error: "invalid email or password" });
  }

  const sessionId = createSession(user.id);
  res.cookie("blog_session", sessionId, {
    httpOnly: true,
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  return res.status(200).json({
    message: "login successful",
    data: {
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
      },
    },
  });
});

authRouter.post("/logout", (req, res) => {
  const sessionId = req.cookies?.blog_session;

  if (sessionId) {
    logoutUser(sessionId);
  }

  res.clearCookie("blog_session");
  return res.status(200).json({ message: "logout successful" });
});

authRouter.get("/me", checkAuth, (req, res) => {
  const sessionId = req.cookies?.blog_session;
  const user = getCurrentUserFromSession(sessionId);

  if (!user) {
    return res.status(401).json({ error: "invalid session" });
  }

  return res.status(200).json({ data: { user } });
});
