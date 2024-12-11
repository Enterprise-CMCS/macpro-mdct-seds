import { Construct } from "constructs";
import {
  aws_dynamodb as dynamodb,
  aws_iam as iam,
  aws_lambda as lambda,
  aws_lambda_nodejs as lambda_nodejs,
  custom_resources as cr,
  Duration,
} from "aws-cdk-lib";
import { DynamoDBTable } from "../constructs/dynamodb-table";
import { IManagedPolicy } from "aws-cdk-lib/aws-iam";

interface CreateDataComponentsProps {
  scope: Construct;
  stage: string;
  iamPermissionsBoundary: IManagedPolicy;
  iamPath: string;
  customResourceRole: iam.Role;
}

export function createDataComponents(props: CreateDataComponentsProps) {
  const { scope, stage } = props;
  const tables = [
    new DynamoDBTable(scope, "FormAnswers", {
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
    }).identifiers,
    new DynamoDBTable(scope, "FormQuestions", {
      stage,
      name: "form-questions",
      partitionKey: { name: "question", type: dynamodb.AttributeType.STRING },
    }).identifiers,
    new DynamoDBTable(scope, "FormTemplates", {
      stage,
      name: "form-templates",
      partitionKey: { name: "year", type: dynamodb.AttributeType.NUMBER },
    }).identifiers,
    new DynamoDBTable(scope, "Forms", {
      stage,
      name: "forms",
      partitionKey: { name: "form", type: dynamodb.AttributeType.STRING },
    }).identifiers,
    new DynamoDBTable(scope, "StateForms", {
      stage,
      name: "state-forms",
      partitionKey: {
        name: "state_form",
        type: dynamodb.AttributeType.STRING,
      },
    }).identifiers,
    new DynamoDBTable(scope, "States", {
      stage,
      name: "states",
      partitionKey: { name: "state_id", type: dynamodb.AttributeType.STRING },
    }).identifiers,
    new DynamoDBTable(scope, "AuthUser", {
      stage,
      name: "auth-user",
      partitionKey: { name: "userId", type: dynamodb.AttributeType.STRING },
    }).identifiers,
  ];

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
    timeout: Duration.seconds(900),
    role: lambdaApiRole,
    environment: {
      dynamoPrefix: stage,
      seedData: (!["production", "val", "master"].includes(stage)).toString(),
      // DYNAMODB_URL: process.env.DYNAMODB_URL || "",
    },
    bundling: {
      commandHooks: {
        beforeBundling(inputDir: string, outputDir: string): string[] {
          return [
            `mkdir -p ${outputDir}/data/initial_data_load/`,
            `cp -r ${inputDir}/services/database/data/initial_data_load/* ${outputDir}/data/initial_data_load/`,
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

  const seedDataInvoke = new cr.AwsCustomResource(
    scope,
    "InvokeSeedDataFunction",
    {
      onCreate: {
        service: "Lambda",
        action: "invoke",
        parameters: {
          FunctionName: seedDataFunction.functionName,
          InvocationType: "Event",
          Payload: JSON.stringify({}),
        },
        physicalResourceId: cr.PhysicalResourceId.of(
          `InvokeSeedDataFunction-${stage}`
        ),
      },
      onUpdate: undefined,
      onDelete: undefined,
      policy: cr.AwsCustomResourcePolicy.fromStatements([
        new iam.PolicyStatement({
          actions: ["lambda:InvokeFunction"],
          resources: [seedDataFunction.functionArn],
        }),
      ]),
      role: props.customResourceRole,
      resourceType: "Custom::InvokeSeedDataFunction",
    }
  );

  seedDataInvoke.node.addDependency(seedDataFunction);

  return { tables };
}
