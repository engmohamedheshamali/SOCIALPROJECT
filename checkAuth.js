import { memoryDb } from "../db/index.js";

export function checkAuth(req, res, next) {
  const sessionId = req.cookies?.blog_session;

  if (!sessionId) {
    return res.status(401).json({ error: "invalid session" });
  }

  const session = memoryDb.sessions.find(
    (item) =>
      item.session_id === sessionId &&
      new Date(item.expires_at).getTime() > Date.now(),
  );

  if (!session) {
    return res.status(401).json({ error: "invalid session" });
  }

  const user = memoryDb.users.find((item) => item.id === session.user_id);

  if (!user) {
    return res.status(401).json({ error: "invalid session" });
  }

  req.user = { id: user.id, username: user.username, email: user.email };
  next();
}
