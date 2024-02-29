import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as db from "aws-cdk-lib/aws-dynamodb";

import * as appsync from "aws-cdk-lib/aws-appsync";
import * as sfn from "aws-cdk-lib/aws-stepfunctions";
import * as events from "aws-cdk-lib/aws-events";
import * as iam from "aws-cdk-lib/aws-iam";
import { RustFunction } from "cargo-lambda-cdk";
import path = require("path");

const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds
const CURRENT_DATE = new Date();
const KEY_EXPIRATION_DATE = new Date(CURRENT_DATE.getTime() + SEVEN_DAYS);
export class CdkAppsyncRustStack extends cdk.Stack {
  api: cdk.aws_appsync.GraphqlApi;
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    this.api = new appsync.GraphqlApi(this, "CdkAppSyncRustApi", {
      name: "cdk-appsync-rust-api",
      definition: appsync.Definition.fromFile("./graphql/schema.graphql"),
      logConfig: { fieldLogLevel: appsync.FieldLogLevel.ALL },
      authorizationConfig: {
        defaultAuthorization: {
          authorizationType: appsync.AuthorizationType.API_KEY,

          apiKeyConfig: {
            name: "default",
            description: "default auth mode",
            expires: cdk.Expiration.atDate(KEY_EXPIRATION_DATE),
          },
        },
      },
    });

    //define dynamodb table and all global secondary indexes

    const table = new db.Table(this, "CdkRustSocial-DB", {
      partitionKey: { name: "id", type: db.AttributeType.STRING },

      billingMode: db.BillingMode.PROVISIONED,
      readCapacity: 5,
      writeCapacity: 5,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });
  }
}
