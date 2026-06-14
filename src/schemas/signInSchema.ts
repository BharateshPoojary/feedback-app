import { z } from "zod";
import { userNameValidation } from "./signUpSchema";

export const signInSchema = z.object({
  identifier: z
    .string()
    .min(1, { message: "Username or email is required" })
    .refine(
      (val) => {
        const isEmail = z.string().email().safeParse(val).success;
        const isUsername = userNameValidation.safeParse(val).success;
        return isEmail || isUsername;
      },
      { message: "Enter a valid email or username" }
    ),

  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" }),
});

export type SignInInput = z.infer<typeof signInSchema>;