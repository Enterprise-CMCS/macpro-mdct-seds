import { Construct } from "constructs";
import { CfnOutput } from "aws-cdk-lib";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";

interface DynamoDBTableProps {
  readonly stage: string;
  readonly name: string;
  readonly partitionKey: { name: string; type: dynamodb.AttributeType };
  readonly gsi?: {
    indexName: string;
    partitionKey: { name: string; type: dynamodb.AttributeType };
  };
}

export class DynamoDBTable extends Construct {
  public readonly table: dynamodb.Table;

  constructor(scope: Construct, id: string, props: DynamoDBTableProps) {
    super(scope, id);

    this.table = new dynamodb.Table(this, "Table", {
      tableName: `${props.stage}-${props.name}`,
      partitionKey: props.partitionKey,
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      stream: dynamodb.StreamViewType.NEW_AND_OLD_IMAGES,
      pointInTimeRecovery: true,
    });

    if (props.gsi) {
      this.table.addGlobalSecondaryIndex({
        indexName: props.gsi.indexName,
        partitionKey: props.gsi.partitionKey,
        projectionType: dynamodb.ProjectionType.ALL,
      });
    }

    new CfnOutput(this, "TableName", {
      value: this.table.tableName,
    });
    new CfnOutput(this, "TableArn", {
      value: this.table.tableArn,
    });
    new CfnOutput(this, "TableStreamArn", {
      value: this.table.tableStreamArn!,
    });
  }
}
