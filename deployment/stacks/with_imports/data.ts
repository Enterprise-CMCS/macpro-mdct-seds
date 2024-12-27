import { Construct } from "constructs";
import { aws_dynamodb as dynamodb } from "aws-cdk-lib";
import { ImportDynamoDBTable } from "./constructs/dynamodb-table";

interface CreateDataComponentsProps {
  scope: Construct;
  stage: string;
}

export function createDataComponents(props: CreateDataComponentsProps) {
  const { scope, stage } = props;

  new ImportDynamoDBTable(scope, "FormAnswers", {
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
  })
  new ImportDynamoDBTable(scope, "FormQuestions", {
    stage,
    name: "form-questions",
    partitionKey: { name: "question", type: dynamodb.AttributeType.STRING },
  })
  new ImportDynamoDBTable(scope, "FormTemplates", {
    stage,
    name: "form-templates",
    partitionKey: { name: "year", type: dynamodb.AttributeType.NUMBER },
  })
  new ImportDynamoDBTable(scope, "Forms", {
    stage,
    name: "forms",
    partitionKey: { name: "form", type: dynamodb.AttributeType.STRING },
  })
  new ImportDynamoDBTable(scope, "StateForms", {
    stage,
    name: "state-forms",
    partitionKey: {
      name: "state_form",
      type: dynamodb.AttributeType.STRING,
    },
  })
  new ImportDynamoDBTable(scope, "States", {
    stage,
    name: "states",
    partitionKey: { name: "state_id", type: dynamodb.AttributeType.STRING },
  })
  new ImportDynamoDBTable(scope, "AuthUser", {
    stage,
    name: "auth-user",
    partitionKey: { name: "userId", type: dynamodb.AttributeType.STRING },
  })
}
