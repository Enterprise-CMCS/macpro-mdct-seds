import { Construct } from "constructs";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";

export interface DynamoDBTableProps {
  readonly stage: string;
  readonly name: string;
  readonly partitionKey: { name: string; type: dynamodb.AttributeType };
  readonly gsi?: {
    indexName: string;
    partitionKey: { name: string; type: dynamodb.AttributeType };
  };
}

export interface DynamoDBTableIdentifiers {
  /** The invariant identifier for the table. Example: "FormAnswers" */
  id: string,
  /** The name of the table within the environment. Example: "production-form-answers" */
  name: string,
  /** The table's TableArn */
  arn: string,
  /** The table's TableStreamArn (if it has one) */
  streamArn: string | undefined,
}

export class DynamoDBTable extends Construct {
  public readonly table: dynamodb.TableV2;
  public readonly identifiers: DynamoDBTableIdentifiers;

  constructor(scope: Construct, id: string, props: DynamoDBTableProps) {
    super(scope, id);

    const tableName = `${props.stage}-${props.name}`;
    this.table = new dynamodb.TableV2(this, "Table", {
      tableName,
      partitionKey: props.partitionKey,
      billing: dynamodb.Billing.onDemand(),
      dynamoStream: dynamodb.StreamViewType.NEW_AND_OLD_IMAGES,
      pointInTimeRecovery: true,
    });
    this.identifiers = {
      id,
      name: tableName,
      arn: this.table.tableArn,
      streamArn: this.table.tableStreamArn,
    };

    if (props.gsi) {
      this.table.addGlobalSecondaryIndex({
        indexName: props.gsi.indexName,
        partitionKey: props.gsi.partitionKey,
        projectionType: dynamodb.ProjectionType.ALL,
      });
    }
  }
}
