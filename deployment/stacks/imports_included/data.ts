import { Construct } from "constructs";
import { aws_dynamodb as dynamodb } from "aws-cdk-lib";
import { DynamoDBTable } from "../../constructs/dynamodb-table";

interface CreateDataComponentsProps {
  scope: Construct;
  stage: string;
  isDev: boolean;
}

export function createDataComponents(props: CreateDataComponentsProps) {
  const { scope, stage, isDev } = props;

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
  })
  new DynamoDBTable(scope, "FormQuestions", {
    stage,
    isDev,
    name: "form-questions",
    partitionKey: { name: "question", type: dynamodb.AttributeType.STRING },
  })
  new DynamoDBTable(scope, "FormTemplates", {
    stage,
    isDev,
    name: "form-templates",
    partitionKey: { name: "year", type: dynamodb.AttributeType.NUMBER },
  })
  new DynamoDBTable(scope, "Forms", {
    stage,
    isDev,
    name: "forms",
    partitionKey: { name: "form", type: dynamodb.AttributeType.STRING },
  })
  new DynamoDBTable(scope, "StateForms", {
    stage,
    isDev,
    name: "state-forms",
    partitionKey: {
      name: "state_form",
      type: dynamodb.AttributeType.STRING,
    },
  })
  new DynamoDBTable(scope, "States", {
    stage,
    isDev,
    name: "states",
    partitionKey: { name: "state_id", type: dynamodb.AttributeType.STRING },
  })
  new DynamoDBTable(scope, "AuthUser", {
    stage,
    isDev,
    name: "auth-user",
    partitionKey: { name: "userId", type: dynamodb.AttributeType.STRING },
  })
}
