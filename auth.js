import { z } from "zod";

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

export const registerSchema = z
  .object({
    username: z.string().trim().min(2, "username must be at least 2 characters"),
    email: z.string().trim().email("invalid email"),
    password: z
      .string()
      .min(8, "password must be at least 8 characters")
      .refine((value) => passwordRegex.test(value), {
        message:
          "password must contain at least one uppercase, lowercase, digit, and special character",
      }),
    password_confirmation: z.string(),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: "password confirmation does not match",
    path: ["password_confirmation"],
  });

export const loginSchema = z.object({
  email: z.string().trim().email("invalid email"),
  password: z.string().min(8, "password must be at least 8 characters"),
});
