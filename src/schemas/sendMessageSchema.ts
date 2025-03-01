import { z } from "zod";

export const sendMessageSchema = z.object({
  message: z.string().min(1, "message cannot be empty"),
  file: z
    .array(z.instanceof(File)) //it can send multiple files at a time so we declared as an array  and it is the instance of  File which is built in class in nodejs to handle file
    .max(3, "You can upload up to 3 files")
    .refine(
      (files) => files.every((file) => file.size < 40 * 1024 * 1024), //.every method return true or false indicating if they satisfy the test or not
      // 1 KB = 1024 bytes
      // 1 MB = 1024 KB = 1024 * 1024 bytes
      // 40 MB = 40 * 1024 * 1024 bytes = 41,943,040 bytes file size must be less than 40 mb
      { message: "Each file must be less than 50 mb" } //this message will be shown if it exceeds the limit
    )
    .refine(
      //types or extensions which are allowed
      (files) =>
        files.every((file) =>
          ["image/png", "image/jpeg", "video/mp4", "video/webm"].includes(
            file.type
          )
        ),
      { message: "Only PNG , JPEG images or MP4,WEBM are allowed" } //this message will be shown if apart form the given file type sent in form
    ),
});
