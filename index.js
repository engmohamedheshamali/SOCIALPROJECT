import crypto from "node:crypto";

export const memoryDb = {
  users: [],
  sessions: [],
  posts: [],
  comments: [],
  likes: [],
};

export function resetDb() {
  memoryDb.users = [];
  memoryDb.sessions = [];
  memoryDb.posts = [];
  memoryDb.comments = [];
  memoryDb.likes = [];
}

export function nextId(list) {
  if (!list.length) return 1;
  return Math.max(...list.map((item) => Number(item.id) || 0)) + 1;
}

export function randomSessionId() {
  return crypto.randomBytes(32).toString("hex");
}

export function nowIso() {
  return new Date().toISOString();
}
