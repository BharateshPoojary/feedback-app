import * as cdk from "aws-cdk-lib";
import * as s3 from "aws-cdk-lib/aws-s3"; //Importing all s3 related class
import { Construct } from "constructs";

export class S3BucketStack extends cdk.Stack {
  public readonly bucket: s3.Bucket; //This is a public member named bucket of type s3.Bucket

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props); //while creating  the object in bin/my-aws-cdk.ts we passed app and stack name that we are sending to super class  where app represent our cdk app

    this.bucket = new s3.Bucket(this, "bharat-snaptalk-bucket", {
      //creating a new s3 bucket under this s3BucketStack class "this" represent the instance of this s3BucketStack class, bharat-snaptalk-bucket is a resource id which uniquely identifies this resource
      versioned: false, //diabled bucket versionining only current version is stored
      bucketName: "bharat-snaptalk-bucket", //name of our bucket
      publicReadAccess: false, //It prevents the public user for reading from  this bucket (there is a constraint if we specifically allow public access in acl or bucket policy this property will not overeride it )
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL, //It blocks all form of public access ensuring no public access can be configured in any way i.e it makes policy and acl list disabled making it uneditable even if we try to allow public access thus making this bucket a private bucket
      cors: [
        //attaching cors policy
        {
          allowedHeaders: ["*"], //It specifies the headers this bucket can accept from request
          allowedMethods: [s3.HttpMethods.GET, s3.HttpMethods.PUT], //Only allowing get and put methods i.e uploading and accessing from  this bucket
          allowedOrigins: ["http://localhost:3000"], //allowed origins or domain which can access this bucket
          exposedHeaders: [], //we can also specify the headers which we want to send as response for a request
          maxAge: 3000, //duration a browser can cache or store the response for a preflight request in seconds
        },
      ],
    });
  }
}
