import bcrypt from "bcrypt";
import { memoryDb, nextId, nowIso, randomSessionId } from "../db/index.js";

export class ValidationFailure extends Error {
  constructor(errors) {
    super("validation failed");
    this.errors = errors;
  }
}

export async function registerUser({ username, email, password, password_confirmation }) {
  const normalizedEmail = email.toLowerCase().trim();

  if (memoryDb.users.some((user) => user.email === normalizedEmail)) {
    throw new ValidationFailure({
      email: { errors: ["email already in use"] },
    });
  }

  if (password !== password_confirmation) {
    throw new ValidationFailure({
      password_confirmation: { errors: ["password confirmation does not match"] },
    });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = {
    id: nextId(memoryDb.users),
    username: username.trim(),
    email: normalizedEmail,
    password_hash: passwordHash,
    created_at: nowIso(),
  };

  memoryDb.users.push(user);

  return { message: "register successful, you can now login" };
}

export async function loginUser({ email, password }) {
  const normalizedEmail = email.toLowerCase().trim();
  const user = memoryDb.users.find((item) => item.email === normalizedEmail);

  if (!user) {
    return null;
  }

  const matches = await bcrypt.compare(password, user.password_hash);
  if (!matches) {
    return null;
  }

  return {
    id: user.id,
    username: user.username,
    email: user.email,
  };
}

export function createSession(userId) {
  const sessionId = randomSessionId();
  const session = {
    id: nextId(memoryDb.sessions),
    session_id: sessionId,
    user_id: userId,
    expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: nowIso(),
  };

  memoryDb.sessions.push(session);
  return sessionId;
}

export function logoutUser(sessionId) {
  memoryDb.sessions = memoryDb.sessions.filter((item) => item.session_id !== sessionId);
}

export function getCurrentUserFromSession(sessionId) {
  const session = memoryDb.sessions.find(
    (item) => item.session_id === sessionId && new Date(item.expires_at).getTime() > Date.now(),
  );

  if (!session) return null;

  const user = memoryDb.users.find((item) => item.id === session.user_id);
  return user ? { id: user.id, username: user.username, email: user.email } : null;
}
