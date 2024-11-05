import * as cdk from "aws-cdk-lib";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import { Construct } from "constructs";
import { DynamoDBTable } from "../local-constructs/dynamodb-table";
import {
  aws_iam as iam,
  aws_lambda as lambda,
  aws_lambda_nodejs as lambda_nodejs,
} from "aws-cdk-lib";

interface DatabaseStackProps extends cdk.NestedStackProps {
  project: string;
  stage: string;
  stack: string;
  isDev: boolean;
}

export class DatabaseStack extends cdk.NestedStack {
  public readonly tables: { [name: string]: dynamodb.Table };
  public readonly seedDataFunction: lambda_nodejs.NodejsFunction | undefined;

  constructor(scope: Construct, id: string, props: DatabaseStackProps) {
    super(scope, id, props);

    const stage = this.node.tryGetContext("stage") || "dev";

    this.tables = {
      "form-answers": new DynamoDBTable(this, "FormAnswers", {
        stage,
        name: "form-answers",
        partitionKey: {
          name: "answer_entry",
          type: dynamodb.AttributeType.STRING,
        },
        gsi: {
          indexName: "state-form-index",
          partitionKey: {
            name: "state_form",
            type: dynamodb.AttributeType.STRING,
          },
        },
      }).table,
      "form-questions": new DynamoDBTable(this, "FormQuestions", {
        stage,
        name: "form-questions",
        partitionKey: { name: "question", type: dynamodb.AttributeType.STRING },
      }).table,
      "form-templates": new DynamoDBTable(this, "FormTemplates", {
        stage,
        name: "form-templates",
        partitionKey: { name: "year", type: dynamodb.AttributeType.NUMBER },
      }).table,
      forms: new DynamoDBTable(this, "Forms", {
        stage,
        name: "forms",
        partitionKey: { name: "form", type: dynamodb.AttributeType.STRING },
      }).table,
      "state-forms": new DynamoDBTable(this, "StateForms", {
        stage,
        name: "state-forms",
        partitionKey: {
          name: "state_form",
          type: dynamodb.AttributeType.STRING,
        },
      }).table,
      states: new DynamoDBTable(this, "States", {
        stage,
        name: "states",
        partitionKey: { name: "state_id", type: dynamodb.AttributeType.STRING },
      }).table,
      "auth-user": new DynamoDBTable(this, "AuthUser", {
        stage,
        name: "auth-user",
        partitionKey: { name: "userId", type: dynamodb.AttributeType.STRING },
      }).table,
    };

    // seed data
    const lambdaApiRole = new iam.Role(this, "LambdaApiRole", {
      assumedBy: new iam.ServicePrincipal("lambda.amazonaws.com"),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName(
          "service-role/AWSLambdaVPCAccessExecutionRole"
        ),
      ],
    });

    lambdaApiRole.addToPolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: [
          "dynamodb:DescribeTable",
          "dynamodb:Query",
          "dynamodb:Scan",
          "dynamodb:GetItem",
          "dynamodb:PutItem",
          "dynamodb:UpdateItem",
          "dynamodb:DeleteItem",
        ],
        resources: ["*"],
      })
    );

    this.seedDataFunction = new lambda_nodejs.NodejsFunction(this, "seedData", {
      entry: "services/database/handlers/seed/seed.js",
      handler: "handler",
      runtime: lambda.Runtime.NODEJS_20_X,
      timeout: cdk.Duration.seconds(300),
      role: lambdaApiRole,
      environment: {
        dynamoPrefix: stage,
        seedData: (!["production", "val", "master"].includes(stage)).toString(),
        DYNAMODB_URL: process.env.DYNAMODB_URL || "",
      },
      bundling: {
        commandHooks: {
          beforeBundling(inputDir: string, outputDir: string): string[] {
            return [
              `mkdir -p ${outputDir}/data/initial_data_load/`,
              `cp -r ${inputDir}/services/database/data/initial_data_load/ ${outputDir}/data/`,
            ];
          },
          afterBundling() {
            return [];
          },
          beforeInstall() {
            return [];
          },
        },
      },
    });

    // Region Output
    new cdk.CfnOutput(this, "Region", { value: this.region });
  }
}
