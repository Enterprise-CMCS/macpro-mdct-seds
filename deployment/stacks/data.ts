import { Construct } from "constructs";
import {
  aws_dynamodb as dynamodb,
  CfnOutput,
  Duration,
  triggers,
} from "aws-cdk-lib";
import { DynamoDBTable } from "../constructs/dynamodb-table.ts";
import { Lambda } from "../constructs/lambda.ts";

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
    new DynamoDBTable(scope, "StateForms", {
      stage,
      isDev,
      name: "state-forms",
      partitionKey: {
        name: "state_form",
        type: dynamodb.AttributeType.STRING,
      },
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

  new triggers.Trigger(scope, "InvokeSeedDataFunction", {
    handler: seedDataFunction,
    invocationType: triggers.InvocationType.EVENT,
  });

  new CfnOutput(scope, "SeedDataFunctionName", {
    value: seedDataFunction.functionName,
  });

  return { tables };
}
