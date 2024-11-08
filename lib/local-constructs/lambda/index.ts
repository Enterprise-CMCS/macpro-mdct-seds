import { Construct } from "constructs";
import {
  NodejsFunction,
  NodejsFunctionProps,
} from "aws-cdk-lib/aws-lambda-nodejs";
import { Duration, Stack, CfnElement } from "aws-cdk-lib";
import { Runtime } from "aws-cdk-lib/aws-lambda";
import {
  Effect,
  ManagedPolicy,
  PolicyDocument,
  PolicyStatement,
  Role,
  ServicePrincipal,
} from "aws-cdk-lib/aws-iam";
import { commonBundlingOptions } from "../../config/bundling-config";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import { ApiStack } from "../../stacks/api";

interface LambdaProps extends Partial<NodejsFunctionProps> {
  handler?: string;
  timeout?: Duration;
  memorySize?: number;
  brokerString?: string;
  path?: string;
  method?: string;
  stackName: string;
  tables: { [name: string]: dynamodb.Table };
  api: apigateway.RestApi;
}

export class Lambda extends Construct {
  public readonly lambda: NodejsFunction;

  constructor(scope: ApiStack, id: string, props: LambdaProps) {
    super(scope, id);

    const {
      handler = "main",
      timeout = Duration.seconds(6),
      memorySize = 1024,
      brokerString = "",
      path,
      method,
      ...restProps
    } = props;

    const stage = this.node.tryGetContext("stage") || "dev";

    const environment = {
      BOOTSTRAP_BROKER_STRING_TLS: brokerString,
      STAGE: stage,
      stage,
      ...Object.values(props.tables).reduce((acc, table) => {
        const currentTable = Stack.of(table)
          .getLogicalId(table.node.defaultChild as CfnElement)
          .slice(0, -8);

        acc[`${currentTable}Name`] = table.tableName;
        acc[`${currentTable}Arn`] = table.tableArn;

        return acc;
      }, {} as { [key: string]: string }),
    };

    const role = new Role(this, `${id}LambdaExecutionRole`, {
      assumedBy: new ServicePrincipal("lambda.amazonaws.com"),
      managedPolicies: [
        ManagedPolicy.fromAwsManagedPolicyName(
          "service-role/AWSLambdaVPCAccessExecutionRole"
        ),
      ],
      inlinePolicies: {
        LambdaPolicy: new PolicyDocument({
          statements: [
            new PolicyStatement({
              effect: Effect.ALLOW,
              actions: ["ssm:GetParameter"],
              resources: ["*"],
            }),
            new PolicyStatement({
              effect: Effect.ALLOW,
              actions: [
                "logs:CreateLogGroup",
                "logs:CreateLogStream",
                "logs:PutLogEvents",
              ],
              resources: ["arn:aws:logs:*:*:*"],
            }),
          ],
        }),
      },
    });

    // TODO: move this into ApiStack and then pass this in rather than creating it here.
    // TODO: instead of this being one policy per table, put all of the tables in one policy in the resources key
    Object.entries(props.tables).forEach(([tableName, table]) => {
      role.addToPolicy(
        new PolicyStatement({
          effect: Effect.ALLOW,
          actions: [
            "dynamodb:BatchWriteItem",
            "dynamodb:DeleteItem",
            "dynamodb:DescribeTable",
            "dynamodb:GetItem",
            "dynamodb:PutItem",
            "dynamodb:Query",
            "dynamodb:Scan",
            "dynamodb:UpdateItem",
          ],
          resources: [table.tableArn],
        })
      );

      const tableStreamArn = scope.getTableStreamArnWithCaching(
        stage,
        tableName
      );

      role.addToPolicy(
        new PolicyStatement({
          effect: Effect.ALLOW,
          actions: [
            "dynamodb:DescribeStream",
            "dynamodb:GetRecords",
            "dynamodb:GetShardIterator",
            "dynamodb:ListShards",
            "dynamodb:ListStreams",
          ],
          resources: [tableStreamArn],
        })
      );
    });

    role.addToPolicy(
      new PolicyStatement({
        effect: Effect.ALLOW,
        actions: ["dynamodb:Query", "dynamodb:Scan"],
        resources: [`${props.tables["form-answers"].tableArn}/index/*`],
      })
    );

    role.addToPolicy(
      new PolicyStatement({
        effect: Effect.ALLOW,
        actions: [
          "cognito-idp:AdminGetUser",
          "ses:SendEmail",
          "ses:SendRawEmail",
          "lambda:InvokeFunction",
          "ssm:GetParameter",
        ],
        resources: ["*"],
      })
    );

    // TODO: test deploy and watch performance with this using lambda.Function vs lambda_nodejs.NodejsFunction
    this.lambda = new NodejsFunction(this, id, {
      functionName: `${props.stackName}-${id}`,
      handler,
      runtime: Runtime.NODEJS_20_X,
      timeout,
      memorySize,
      role,
      bundling: commonBundlingOptions,
      environment,
      ...restProps,
    });

    if (path && method) {
      const resource = props.api.root.resourceForPath(path);
      resource.addMethod(
        method,
        new apigateway.LambdaIntegration(this.lambda),
        {
          authorizationType: apigateway.AuthorizationType.IAM,
        }
      );
    }
  }
}
