import { NextRequest } from "next/server";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { responseContent } from "@/hooks/use-response";
const client = new S3Client({
  region: process.env.S3_REGION as string,
  credentials: {
    accessKeyId: process.env.ACCESS_KEY as string,
    secretAccessKey: process.env.SECRET_KEY as string,
  },
});
//This route will generate a presigned url for the file name sent form client and the presigned url is then sent to client for uploading work
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const file: string | null = searchParams.get("file");
  if (!file) {
    return responseContent(false, "Please enter a valid file", 400);
  }
  const img_extensions: string[] = [".jpg", ".jpeg", ".png", ".gif", ".webp"];
  const video_extensions: string[] = [".mp4", ".mov", ".avi", ".mkv"];
  let key = "";
  if (img_extensions.includes(file)) {
    key = `images/${file}`;
  }
  if (video_extensions.includes(file)) {
    key = `videos/${file}`;
  }
  const command = new PutObjectCommand({
    Bucket: process.env.S3_BUCKET_NAME,
    Key: key,
  });
  const getPresignedUrl = await getSignedUrl(client, command);
  if (getPresignedUrl) {
    return Response.json(
      {
        success: true,
        preSignedUrl: getPresignedUrl,
      },
      { status: 200 }
    );
  }
}
//To do handle multiple file upload
