import { z } from "zod";
export const messageSchema = z.object({
  content: z
    .string()
    .min(10, "message must be atleast 10 characters")
    .max(300, "message should not be more than 300 characters"),
});
