import { responseContent } from "@/hooks/use-response";
import { client } from "../../presigned-url/route";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
export async function DELETE(
  request: Request,
  { params }: { params: { key: string } }
) {
  const key = params.key;
  const img_extensions: string[] = [
    "apng",
    "avif",
    "gif",
    "jpeg",
    "jpg",
    "png",
    "svg",
    "webp",
    "bmp",
    "tiff",
    "ico", // For image/x-icon
  ];

  const video_extensions: string[] = [
    "mp4",
    "webm",
    "ogg",
    "avi",
    "mpeg",
    "mov", // QuickTime
    "wmv", // x-ms-wmv
    "flv", // x-flv
    "3gp", // 3gpp
    "3g2", // 3gpp2
    "mkv", // x-matroska
  ];

  let fileName = "";
  const fileextension = key.split(".").pop() || "";
  console.log(fileextension);
  if (img_extensions.includes(fileextension)) {
    fileName = `images/${key}`;
  }
  if (video_extensions.includes(fileextension)) {
    fileName = `videos/${key}`;
  }
  console.log(fileName);
  const deleteCommand = new DeleteObjectCommand({
    Bucket: process.env.S3_BUCKET_NAME,
    Key: fileName,
  });
  try {
    await client.send(deleteCommand);

    return responseContent(true, "Media deleted successfully", 200);
  } catch (error) {
    return responseContent(false, "Error deleting media", 500);
  }
}
