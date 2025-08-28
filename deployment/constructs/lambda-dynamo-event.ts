import { Construct } from "constructs";
import {
  aws_dynamodb as dynamodb,
  aws_iam as iam,
  aws_lambda as lambda,
  aws_lambda_nodejs as lambda_nodejs,
  aws_logs as logs,
  Duration,
  RemovalPolicy,
} from "aws-cdk-lib";
import { DynamoDBTableIdentifiers } from "../constructs/dynamodb-table";
import { createHash } from "crypto";

interface LambdaDynamoEventProps
  extends Partial<lambda_nodejs.NodejsFunctionProps> {
  additionalPolicies?: iam.PolicyStatement[];
  stackName: string;
  tables: DynamoDBTableIdentifiers[];
  isDev: boolean;
}

export class LambdaDynamoEventSource extends Construct {
  public readonly lambda: lambda_nodejs.NodejsFunction;

  constructor(scope: Construct, id: string, props: LambdaDynamoEventProps) {
    super(scope, id);

    const {
      additionalPolicies = [],
      memorySize = 1024,
      tables,
      stackName,
      timeout = Duration.seconds(6),
      isDev,
      ...restProps
    } = props;

    const logGroup = new logs.LogGroup(this, `${id}LogGroup`, {
      logGroupName: `/aws/lambda/${stackName}-${id}`,
      removalPolicy: isDev ? RemovalPolicy.DESTROY : RemovalPolicy.RETAIN,
      retention: logs.RetentionDays.THREE_YEARS, // exceeds the 30 month requirement
    });

    this.lambda = new lambda_nodejs.NodejsFunction(this, id, {
      functionName: `${stackName}-${id}`,
      runtime: lambda.Runtime.NODEJS_20_X,
      timeout,
      memorySize,
      bundling: {
        assetHash: createHash("sha256")
          .update(`${Date.now()}-${id}`)
          .digest("hex"),
        minify: true,
        sourceMap: true,
        nodeModules: ["kafkajs"],
      },
      logGroup,
      ...restProps,
    });

    const importedTables = tables
      .filter((t) => !!t.streamArn)
      .map((t, i) =>
        dynamodb.Table.fromTableAttributes(this, `${id}ImportedTable${i}`, {
          tableArn: t.arn,
          tableStreamArn: t.streamArn!,
        })
      );

    for (const table of importedTables) table.grantStreamRead(this.lambda);

    for (const stmt of additionalPolicies) this.lambda.addToRolePolicy(stmt);

    for (let table of tables) {
      new lambda.CfnEventSourceMapping(
        scope,
        `${id}${table.id}DynamoDBStreamEventSourceMapping`,
        {
          eventSourceArn: table.streamArn,
          functionName: this.lambda.functionArn,
          startingPosition: "TRIM_HORIZON",
          maximumRetryAttempts: 2,
          batchSize: 10,
          enabled: true,
        }
      );
    }
  }
}
