import { NextRequest } from "next/server";
import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { responseContent } from "@/hooks/use-response";
import path from "path";
//This route will generate a presigned url for the file name sent form client and the presigned url is then sent to client for uploading work
export const client = new S3Client({
  region: process.env.S3_REGION as string,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY as string,
    secretAccessKey: process.env.S3_SECRET_KEY as string,
  },
});
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const file: string | null = searchParams.get("file");
  const fileType = searchParams.get("type");
  console.log(fileType);
  if (!file) {
    return responseContent(false, "Please enter a valid file", 400);
  }
  const img_extensions: string[] = [
    ".apng",
    ".avif",
    ".gif",
    ".jpeg",
    ".jpg",
    ".png",
    ".svg",
    ".webp",
    ".bmp",
    ".tiff",
    ".ico", // For image/x-icon
  ];

  const video_extensions: string[] = [
    ".mp4",
    ".webm",
    ".ogg",
    ".avi",
    ".mpeg",
    ".mov", // QuickTime
    ".wmv", // x-ms-wmv
    ".flv", // x-flv
    ".3gp", // 3gpp
    ".3g2", // 3gpp2
    ".mkv", // x-matroska
  ];

  let key = "";
  const fileextension = path.extname(file).toLowerCase();
  console.log(fileextension);
  if (img_extensions.includes(fileextension)) {
    key = `images/${file}`;
  }
  if (video_extensions.includes(fileextension)) {
    key = `videos/${file}`;
  }
  const putObjectCommand = new PutObjectCommand({
    Bucket: process.env.S3_BUCKET_NAME,
    Key: key,
  });
  const putPresignedUrl = await getSignedUrl(client, putObjectCommand);
  const getObjectCommand = new GetObjectCommand({
    Bucket: process.env.S3_BUCKET_NAME,
    Key: key,
  });
  const getPresignedUrl = await getSignedUrl(client, getObjectCommand);
  if (getPresignedUrl && putPresignedUrl) {
    return Response.json(
      {
        success: true,
        putPresignedUrl,
        getPresignedUrl,
        fileName: file,
        key,
      },
      { status: 200 }
    );
  }
}
//To do handle multiple file upload
