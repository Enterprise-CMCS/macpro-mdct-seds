import * as cdk from "aws-cdk-lib";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import { Construct } from "constructs";
import { DynamoDBTable } from "../local-constructs/dynamodb-table";

interface DatabaseStackProps extends cdk.NestedStackProps {
  project: string;
  stage: string;
  stack: string;
  isDev: boolean;
}

export class DatabaseStack extends cdk.NestedStack {
  public readonly tables: { [name: string]: dynamodb.Table };

  constructor(scope: Construct, id: string, props: DatabaseStackProps) {
    super(scope, id, props);

    const stage = this.node.tryGetContext("stage") || "dev";

    this.tables = {
      "age-ranges": new DynamoDBTable(this, "AgeRanges", {
        stage,
        name: "age-ranges",
        partitionKey: { name: "ageRange", type: dynamodb.AttributeType.STRING },
      }).table,
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
      status: new DynamoDBTable(this, "Status", {
        stage,
        name: "status",
        partitionKey: { name: "status", type: dynamodb.AttributeType.STRING },
      }).table,
      "auth-user": new DynamoDBTable(this, "AuthUser", {
        stage,
        name: "auth-user",
        partitionKey: { name: "userId", type: dynamodb.AttributeType.STRING },
      }).table,
      "auth-user-roles": new DynamoDBTable(this, "AuthUserRoles", {
        stage,
        name: "auth-user-roles",
        partitionKey: { name: "userId", type: dynamodb.AttributeType.STRING },
      }).table,
      "auth-user-states": new DynamoDBTable(this, "AuthUserStates", {
        stage,
        name: "auth-user-states",
        partitionKey: { name: "userId", type: dynamodb.AttributeType.STRING },
      }).table,
    };

    // Region Output
    new cdk.CfnOutput(this, "Region", { value: this.region });
  }
}
