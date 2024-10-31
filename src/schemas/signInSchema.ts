import { z } from "zod";
export const signInSchema = z.object({
  Identifier: z.string(), //Identifier  which can be also called as username
  password: z.string(),
});

/**This is we are implementing zod validation where we are reducing the work of monodb
 * by using zod it provides multiple builtin methods for different types of validation
 */
