import { z } from "zod";

export const createPostSchema = z.object({
  content: z
    .string()
    .trim()
    .min(1, "post content cannot be empty")
    .max(5000, "post content is too long"),
  image: z.string().nullable().optional(),
});

export const commentSchema = z.object({
  content: z
    .string()
    .trim()
    .min(1, "comment content cannot be empty")
    .max(2000, "comment content is too long"),
});
