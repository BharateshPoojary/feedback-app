import { z } from "zod";

export const signInSchema = z.object({
  identifier: z
    .string()
    .min(1, { message: "Username or email is required" })
    .refine(
      (val) => {
        const isEmail = z.string().email().safeParse(val).success;
        const isUsername = /^[a-zA-Z0-9_]{3,20}$/.test(val);
        return isEmail || isUsername;
      },
      {
        message: "Must be a valid email or username (3–20 alphanumeric characters)",
      }
    ),

  password: z
    .string()
    .min(1, { message: "Password is required" }),
});

export type SignInInput = z.infer<typeof signInSchema>;

/**This is we are implementing zod validation where we are reducing the work of monogodb
 * by using zod it provides multiple builtin methods for different types of validation
 */
