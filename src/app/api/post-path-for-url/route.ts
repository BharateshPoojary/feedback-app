import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { client } from "../presigned-url/route";
import { responseContent } from "@/hooks/use-response";

export async function POST(request: Request) {
  const { fileName }: { fileName: string } = await request.json();
  const getCommand = new GetObjectCommand({
    Bucket: process.env.S3_BUCKET_NAME,
    Key: fileName,
  });
  try {
    const getPresignedUrl = await getSignedUrl(client, getCommand);
    return Response.json(
      {
        success: true,
        getPresignedUrl,
      },
      { status: 200 }
    );
  } catch (error) {
    return responseContent(false, "Error getting url", 500);
  }
}
