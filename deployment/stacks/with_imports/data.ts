import { Construct } from "constructs";
import { aws_dynamodb as dynamodb } from "aws-cdk-lib";
import { DynamoDBTable } from "../../constructs/dynamodb-table";

interface CreateDataComponentsProps {
  scope: Construct;
  stage: string;
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

  return { tables };
}
