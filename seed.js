import bcrypt from "bcrypt";
import { memoryDb, nextId } from "./db/index.js";

export async function seedDemoData() {
  if (memoryDb.users.length > 0) {
    return;
  }

  const passwordHash = await bcrypt.hash("Password123!", 10);

  const user = {
    id: nextId(memoryDb.users),
    username: "demo_user",
    email: "demo@example.com",
    password_hash: passwordHash,
    created_at: new Date().toISOString(),
  };

  memoryDb.users.push(user);

  const post = {
    id: nextId(memoryDb.posts),
    user_id: user.id,
    content: "Welcome to Inkwell! This is the first post in the demo feed.",
    image: null,
    created_at: new Date().toISOString(),
  };

  memoryDb.posts.push(post);
}
