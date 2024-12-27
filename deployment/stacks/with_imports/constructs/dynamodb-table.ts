import { Construct } from "constructs";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import { DynamoDBTableProps } from "../../../constructs/dynamodb-table"

export class ImportDynamoDBTable extends Construct {
  public readonly table: dynamodb.TableV2;

  constructor(scope: Construct, id: string, props: DynamoDBTableProps) {
    super(scope, id);

    const tableName = `${props.stage}-${props.name}`;
    this.table = new dynamodb.TableV2(this, "Table", {
      tableName,
      partitionKey: props.partitionKey,
      billing: dynamodb.Billing.onDemand(),
      // intentionally not adding dynamoStream config here and POTR false to have change occur during big deploy and get change to happen
      pointInTimeRecovery: false,
    });

    if (props.gsi) {
      this.table.addGlobalSecondaryIndex({
        indexName: props.gsi.indexName,
        partitionKey: props.gsi.partitionKey,
        projectionType: dynamodb.ProjectionType.ALL,
      });
    }
  }
}

