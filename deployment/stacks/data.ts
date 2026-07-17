import { Construct } from "constructs";
import {
  aws_lambda as lambda,
  aws_dynamodb as dynamodb,
  CfnOutput,
  Duration,
  triggers,
} from "aws-cdk-lib";
import { DynamoDBTable } from "../constructs/dynamodb-table.ts";
import { Lambda } from "../constructs/lambda.ts";
import { isLocalAwsEmulator } from "../local/util.ts";

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
  const seedDataLayerExcludes = [
    "handlers",
    "scripts",
    "utils",
    "README.md",
    "package.json",
    ".gitignore",
  ];
  const seedDataNonAnswerExcludes = [
    "data/initial_data_load/api_sample.json",
    "data/initial_data_load/auth_user_roles.json",
    "data/initial_data_load/form_questions_2019.json",
    "data/initial_data_load/form_answers_template.json",
  ];
  const seedDataAnswerExcludes = [
    "data/initial_data_load/form_questions_*.json",
    "data/initial_data_load/form_template_*.json",
    "data/initial_data_load/forms.json",
    "data/initial_data_load/state_forms*.json",
    ...seedDataNonAnswerExcludes,
  ];
  const seedDataLayers = isLocalAwsEmulator
    ? [
        new lambda.LayerVersion(scope, "SeedDataLayer", {
          code: lambda.Code.fromAsset("services/database", {
            exclude: [
              ...seedDataLayerExcludes,
              ...seedDataNonAnswerExcludes,
              "data/initial_data_load/form_answers_*.json",
            ],
          }),
          compatibleRuntimes: [lambda.Runtime.NODEJS_22_X],
        }),
        new lambda.LayerVersion(scope, "SeedDataAnswersAMLayer", {
          code: lambda.Code.fromAsset("services/database", {
            exclude: [
              ...seedDataLayerExcludes,
              ...seedDataAnswerExcludes,
              "data/initial_data_load/form_answers_N*.json",
              "data/initial_data_load/form_answers_O*.json",
              "data/initial_data_load/form_answers_P*.json",
              "data/initial_data_load/form_answers_Q*.json",
              "data/initial_data_load/form_answers_R*.json",
              "data/initial_data_load/form_answers_S*.json",
              "data/initial_data_load/form_answers_T*.json",
              "data/initial_data_load/form_answers_U*.json",
              "data/initial_data_load/form_answers_V*.json",
              "data/initial_data_load/form_answers_W*.json",
              "data/initial_data_load/form_answers_X*.json",
              "data/initial_data_load/form_answers_Y*.json",
              "data/initial_data_load/form_answers_Z*.json",
            ],
          }),
          compatibleRuntimes: [lambda.Runtime.NODEJS_22_X],
        }),
        new lambda.LayerVersion(scope, "SeedDataAnswersNZLayer", {
          code: lambda.Code.fromAsset("services/database", {
            exclude: [
              ...seedDataLayerExcludes,
              ...seedDataAnswerExcludes,
              "data/initial_data_load/form_answers_A*.json",
              "data/initial_data_load/form_answers_B*.json",
              "data/initial_data_load/form_answers_C*.json",
              "data/initial_data_load/form_answers_D*.json",
              "data/initial_data_load/form_answers_E*.json",
              "data/initial_data_load/form_answers_F*.json",
              "data/initial_data_load/form_answers_G*.json",
              "data/initial_data_load/form_answers_H*.json",
              "data/initial_data_load/form_answers_I*.json",
              "data/initial_data_load/form_answers_J*.json",
              "data/initial_data_load/form_answers_K*.json",
              "data/initial_data_load/form_answers_L*.json",
              "data/initial_data_load/form_answers_M*.json",
            ],
          }),
          compatibleRuntimes: [lambda.Runtime.NODEJS_22_X],
        }),
      ]
    : undefined;

  const seedDataFunction = new Lambda(scope, "seedData", {
    stackName: `data-${stage}`,
    entry: "services/database/handlers/seed/seed.js",
    handler: "handler",
    timeout: Duration.seconds(900),
    environment: {
      ...(seedDataLayers ? { NODE_PATH: "/opt" } : {}),
      dynamoPrefix: stage,
      seedData: isDev.toString(),
    },
    isDev,
    ...(seedDataLayers ? { layers: seedDataLayers } : {}),
    bundling: isLocalAwsEmulator
      ? { minify: true }
      : {
          commandHooks: {
            beforeBundling() {
              return [];
            },
            afterBundling(inputDir: string, outputDir: string): string[] {
              return [
                `mkdir -p ${outputDir}/data/initial_data_load/ ${outputDir}/node_modules/data/initial_data_load/`,
                `cp -r ${inputDir}/services/database/data/initial_data_load/* ${outputDir}/data/initial_data_load/`,
                `cp -r ${inputDir}/services/database/data/initial_data_load/* ${outputDir}/node_modules/data/initial_data_load/`,
              ];
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

  if (!isLocalAwsEmulator) {
    new triggers.Trigger(scope, "InvokeSeedDataFunction", {
      handler: seedDataFunction,
      invocationType: triggers.InvocationType.EVENT,
    });
  }

  new CfnOutput(scope, "SeedDataFunctionName", {
    value: seedDataFunction.functionName,
  });

  return { tables };
}
