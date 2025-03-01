import * as cdk from "aws-cdk-lib"; //Importing cloud dev kit as cdk so that we can deploy the stacks in our underlying cloud infrastructure
import { User, PolicyStatement } from "aws-cdk-lib/aws-iam"; //importing only user and policy statement
import { Construct } from "constructs"; //Construct is a fundamental building block used to define resources logically
//It ensures that all stack which we create is in the scope of app i.e. our cloud infrastructure

export class IAMUserStack extends cdk.Stack {
  //This is IAMUserStack which extends cdk.Stack ensuring it is one of the  stack inside our cloud infrastructure
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    //when we create object values for this parameter are passed from there
    // where props is optional which represents the stack props  i.e stack descriptions here scope is our cdk app it tells that the  scope of this stack should be with in this cdk app id repreent
    super(scope, id, props); //sending the values of constructor to super class constructor i.e. cdk.Stack which is our parent class by doing this we are giving info. about this stack to super class so that it can be a part of our  cloud infrastructure i.e it is one of the  stack under cloud infrastructure which we defined during aws configuration
    const iamUser: User = new User(this, "bharat-snaptalk-user"); //creating a new IAMUSER by instantiating it
    //"this" keyword represent the instance of this class(IAMUSERStack)  It tells that this User constructor or UserObject belongs to or comes under the scope of this IAMUSERSTACK class and the bharat-snaptalk-user  is a resource id which uniquely defines this user resource
    const policyStatement: PolicyStatement = new PolicyStatement({
      //creating a new policy object and defining the action and resources which we want to grant this user
      actions: ["s3:PutObject", "s3:GetObject"], //get and put object allowed to this user
      resources: ["arn:aws:s3:::bharat-snaptalk-bucket"], //bucket arn on which we want to allow this actions
    });
    iamUser.addToPolicy(policyStatement); //adding or attaching the policy to the user created
  }
}
