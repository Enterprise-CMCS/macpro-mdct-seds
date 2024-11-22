import * as cdk from "aws-cdk-lib";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import { Construct } from "constructs";
import { DynamoDBTable } from "../constructs/dynamodb-table";
import {
  aws_iam as iam,
  aws_lambda as lambda,
  aws_lambda_nodejs as lambda_nodejs,
} from "aws-cdk-lib";
import { IManagedPolicy } from "aws-cdk-lib/aws-iam";

interface DatabaseStackProps extends cdk.NestedStackProps {
  project: string;
  stage: string;
  stack: string;
  isDev: boolean;
  iamPermissionsBoundary: IManagedPolicy;
  iamPath: string;
}

export class DatabaseStack extends cdk.NestedStack {
  public readonly tables: { [name: string]: dynamodb.Table };
  // TODO: can table data be loaded into a structure like this?
  // public readonly tables: { name: string, arn: string, streamArn: string }[];
  public readonly seedDataFunction: lambda_nodejs.NodejsFunction | undefined;

  constructor(scope: Construct, id: string, props: DatabaseStackProps) {
    super(scope, id, props);

    const stage = props.stage;

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
      permissionsBoundary: props.iamPermissionsBoundary,
      path: props.iamPath,
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

    // TODO: test deploy and watch performance with this using lambda.Function vs lambda_nodejs.NodejsFunction
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
              `mkdir --parents ${outputDir}/data/initial_data_load/`,
              `cp --recursive ${inputDir}/services/database/data/initial_data_load/ ${outputDir}/data/initial_data_load/`,
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
  }
}
