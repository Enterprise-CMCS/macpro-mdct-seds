import { Construct } from "constructs";
import { aws_dynamodb as dynamodb } from "aws-cdk-lib";
import { DynamoDBTable } from "../../constructs/dynamodb-table";

interface CreateDataComponentsProps {
  scope: Construct;
  stage: string;
}

export function createDataComponents(props: CreateDataComponentsProps) {
  const { scope, stage } = props;

  new DynamoDBTable(scope, "FormAnswers", {
    stage,
    isDev: false,
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
  });
  new DynamoDBTable(scope, "FormQuestions", {
    stage,
    isDev: false,
    name: "form-questions",
    partitionKey: { name: "question", type: dynamodb.AttributeType.STRING },
  });
  new DynamoDBTable(scope, "FormTemplates", {
    stage,
    isDev: false,
    name: "form-templates",
    partitionKey: { name: "year", type: dynamodb.AttributeType.NUMBER },
  });
  new DynamoDBTable(scope, "Forms", {
    stage,
    isDev: false,
    name: "forms",
    partitionKey: { name: "form", type: dynamodb.AttributeType.STRING },
  });
  new DynamoDBTable(scope, "StateForms", {
    stage,
    isDev: false,
    name: "state-forms",
    partitionKey: {
      name: "state_form",
      type: dynamodb.AttributeType.STRING,
    },
  });
  new DynamoDBTable(scope, "States", {
    stage,
    isDev: false,
    name: "states",
    partitionKey: { name: "state_id", type: dynamodb.AttributeType.STRING },
  });
  new DynamoDBTable(scope, "AuthUser", {
    stage,
    isDev: false,
    name: "auth-user",
    partitionKey: { name: "userId", type: dynamodb.AttributeType.STRING },
  });
}
