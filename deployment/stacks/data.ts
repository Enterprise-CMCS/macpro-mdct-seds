import { Construct } from "constructs";
import {
  aws_dynamodb as dynamodb,
  aws_iam as iam,
  custom_resources as cr,
  CfnOutput,
  Duration,
} from "aws-cdk-lib";
import { DynamoDBTable } from "../constructs/dynamodb-table";
import { Lambda } from "../constructs/lambda";

interface CreateDataComponentsProps {
  scope: Construct;
  stage: string;
  isDev: boolean;
}

export function createDataComponents(props: CreateDataComponentsProps) {
  const { scope, stage, isDev } = props;

  const tables = [
    new DynamoDBTable(scope, "FormAnswers", {
      stage,
      isDev,
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
    }),
    new DynamoDBTable(scope, "FormQuestions", {
      stage,
      isDev,
      name: "form-questions",
      partitionKey: { name: "question", type: dynamodb.AttributeType.STRING },
    }),
    new DynamoDBTable(scope, "FormTemplates", {
      stage,
      isDev,
      name: "form-templates",
      partitionKey: { name: "year", type: dynamodb.AttributeType.NUMBER },
    }),
    new DynamoDBTable(scope, "Forms", {
      stage,
      isDev,
      name: "forms",
      partitionKey: { name: "form", type: dynamodb.AttributeType.STRING },
    }),
    new DynamoDBTable(scope, "StateForms", {
      stage,
      isDev,
      name: "state-forms",
      partitionKey: {
        name: "state_form",
        type: dynamodb.AttributeType.STRING,
      },
    }),
    new DynamoDBTable(scope, "States", {
      stage,
      isDev,
      name: "states",
      partitionKey: { name: "state_id", type: dynamodb.AttributeType.STRING },
    }),
    new DynamoDBTable(scope, "AuthUser", {
      stage,
      isDev,
      name: "auth-user",
      partitionKey: { name: "userId", type: dynamodb.AttributeType.STRING },
    }),
  ];

  // seed data
  const seedDataFunction = new Lambda(scope, "seedData", {
    stackName: `data-${stage}`,
    entry: "services/database/handlers/seed/seed.js",
    handler: "handler",
    timeout: Duration.seconds(900),
    environment: {
      dynamoPrefix: stage,
      seedData: isDev.toString(),
    },
    isDev,
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
  }).lambda;

  for (const ddbTable of tables) {
    ddbTable.table.grantReadWriteData(seedDataFunction);
  }

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
      resourceType: "Custom::InvokeSeedDataFunction",
    }
  );

  new CfnOutput(scope, "SeedDataFunctionName", {
    value: seedDataFunction.functionName,
  });

  seedDataInvoke.node.addDependency(seedDataFunction);

  return { tables };
}
