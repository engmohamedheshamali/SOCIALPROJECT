export const schema = {
  users: [
    "id",
    "username",
    "email",
    "password_hash",
    "created_at",
  ],
  sessions: ["id", "session_id", "user_id", "expires_at", "created_at"],
  posts: ["id", "user_id", "content", "image", "created_at"],
  comments: ["id", "post_id", "user_id", "content", "created_at"],
  likes: ["user_id", "post_id", "created_at"],
};
