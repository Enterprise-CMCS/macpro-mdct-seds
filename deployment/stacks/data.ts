import { Construct } from "constructs";
import {
  aws_dynamodb as dynamodb,
  aws_iam as iam,
  aws_lambda as lambda,
  aws_lambda_nodejs as lambda_nodejs,
  Duration,
} from "aws-cdk-lib";
import { DynamoDBTable } from "../constructs/dynamodb-table";
import { IManagedPolicy } from "aws-cdk-lib/aws-iam";

interface CreateDataComponentsProps {
  scope: Construct;
  stage: string;
  iamPermissionsBoundary: IManagedPolicy;
  iamPath: string;
}

export function createDataComponents(props: CreateDataComponentsProps) {
  const { scope, stage } = props;
  const tables = {
    "form-answers": new DynamoDBTable(scope, "FormAnswers", {
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
    "form-questions": new DynamoDBTable(scope, "FormQuestions", {
      stage,
      name: "form-questions",
      partitionKey: { name: "question", type: dynamodb.AttributeType.STRING },
    }).table,
    "form-templates": new DynamoDBTable(scope, "FormTemplates", {
      stage,
      name: "form-templates",
      partitionKey: { name: "year", type: dynamodb.AttributeType.NUMBER },
    }).table,
    forms: new DynamoDBTable(scope, "Forms", {
      stage,
      name: "forms",
      partitionKey: { name: "form", type: dynamodb.AttributeType.STRING },
    }).table,
    "state-forms": new DynamoDBTable(scope, "StateForms", {
      stage,
      name: "state-forms",
      partitionKey: {
        name: "state_form",
        type: dynamodb.AttributeType.STRING,
      },
    }).table,
    states: new DynamoDBTable(scope, "States", {
      stage,
      name: "states",
      partitionKey: { name: "state_id", type: dynamodb.AttributeType.STRING },
    }).table,
    "auth-user": new DynamoDBTable(scope, "AuthUser", {
      stage,
      name: "auth-user",
      partitionKey: { name: "userId", type: dynamodb.AttributeType.STRING },
    }).table,
  };

  // seed data
  const lambdaApiRole = new iam.Role(scope, "SeedDataLambdaApiRole", {
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
  const seedDataFunction = new lambda_nodejs.NodejsFunction(scope, "seedData", {
    entry: "services/database/handlers/seed/seed.js",
    handler: "handler",
    runtime: lambda.Runtime.NODEJS_20_X,
    timeout: Duration.seconds(300),
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
            `cp -r ${inputDir}/services/database/data/initial_data_load/ ${outputDir}/data/initial_data_load/`,
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

  return { seedDataFunctionName: seedDataFunction.functionName, tables };
}