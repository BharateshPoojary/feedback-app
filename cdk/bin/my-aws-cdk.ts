#!/usr/bin/env node
import * as cdk from "aws-cdk-lib"; //Importing cloud dev kit as cdk so that we can deploy the stacks in our underlying cloud infrastructure
//I am using modular way so I created each stack seperately in different files
import { S3BucketStack } from "../lib/S3BucketStack"; //importing the s3 bucket stack so that we can instantiate it

import { IAMUserStack } from "../lib/IAMUserStack"; //importing the IAM User  stack so that we can instantiate it
// import { MyAwsCdkStack } from '../lib/my-aws-cdk-stack';

const app = new cdk.App(); //creating an instance of cdk application and  this application represents our AWS cloud infrastructure which we configured using aws configure command
new S3BucketStack(app, "bharat-snaptalk-bucket"); //creating an instance for the defined s3 Bucket class and passing argument to constructor parameter
// here app is representing our cloud infrastructure and we are telling cdk to add this stack into this cdk application i.e to our cloud infrastructure  and bharat-snaptalk-bucket is the stack name which uniquely identifies the stack
new IAMUserStack(app, "IAMUserStack");
