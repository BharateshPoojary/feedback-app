import { z } from "zod";

export const userNameValidation = z
  .string()
  .min(2, "Username must be atleast 2 characters")
  .max(20, "Username should not be more than 20 characters")
  .regex(
    /^[a-zA-Z0-9_-]+$/,
    "username must ony include letters,numbers,hyphen and underscore"
  );

export const signUpSchemaValidation = z.object({
  userName: userNameValidation,
  email: z.string().email({ message: "emailaddress is invalid" }),
  password: z
    .string()
    .min(6, { message: "password must be atleast 6 characters" }),
});
