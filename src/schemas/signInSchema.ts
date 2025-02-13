import { z } from "zod";
export const signInSchema = z.object({
  identifier: z.string(), //Identifier  which can be  username or email
  password: z.string(),
});

/**This is we are implementing zod validation where we are reducing the work of monogodb
 * by using zod it provides multiple builtin methods for different types of validation
 */
