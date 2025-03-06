import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { responseContent } from "@/hooks/use-response";

export async function POST(request: Request) {
  const client = new S3Client({
    region: process.env.S3_REGION as string,
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY as string,
      secretAccessKey: process.env.S3_SECRET_KEY as string,
    },
  });
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
  } catch (error: unknown) {
    if (error instanceof Error) {
      return responseContent(
        false,
        `Error getting presigned url: ${error.message}`,
        500
      );
    }
    return responseContent(
      false,
      "Unknown error occurred while getting pre signed url ",
      500
    );
  }
}
