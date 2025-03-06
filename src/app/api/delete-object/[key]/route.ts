import { responseContent } from "@/hooks/use-response";
import { DeleteObjectCommand, S3Client } from "@aws-sdk/client-s3";
export async function DELETE(
  request: Request,
  { params }: { params: { key: string } }
) {
  const client = new S3Client({
    region: process.env.S3_REGION as string,
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY as string,
      secretAccessKey: process.env.S3_SECRET_KEY as string,
    },
  });
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
  } catch (error: unknown) {
    if (error instanceof Error) {
      return responseContent(
        false,
        `Error deleting user object: ${error.message}`,
        500
      );
    }
    return responseContent(
      false,
      "Unknown error occurred while deleting user object",
      500
    );
  }
}
