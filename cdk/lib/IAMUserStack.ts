import * as cdk from "aws-cdk-lib"; //Importing cloud dev kit as cdk so that we can deploy the stacks in our underlying cloud infrastructure
import { User, PolicyStatement } from "aws-cdk-lib/aws-iam"; //importing only user and policy statement
import { Construct } from "constructs";

export class IAMUserStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    const iamUser: User = new User(this, "bharat-snaptalk-user");
    const policyStatement: PolicyStatement = new PolicyStatement({
      actions: ["s3:PutObject", "s3:GetObject"],
      resources: ["arn:aws:s3:::bharat-snaptalk-bucket"],
    });
    iamUser.addToPolicy(policyStatement);
  }
}
