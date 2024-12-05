import { Construct } from "constructs";
import {
  aws_dynamodb as dynamodb,
  aws_iam as iam,
  aws_lambda as lambda,
  aws_lambda_nodejs as lambda_nodejs,
  Duration,
} from "aws-cdk-lib";

interface LambdaDynamoEventProps
  extends Partial<lambda_nodejs.NodejsFunctionProps> {
  additionalPolicies?: iam.PolicyStatement[];
  brokerString?: string;
  iamPath: string;
  iamPermissionsBoundary: iam.IManagedPolicy;
  stackName: string;
  tables: dynamodb.Table[];
}

export class LambdaDynamoEventSource extends Construct {
  public readonly lambda: lambda_nodejs.NodejsFunction;

  constructor(scope: Construct, id: string, props: LambdaDynamoEventProps) {
    super(scope, id);

    const {
      additionalPolicies = [],
      brokerString = "",
      environment = {},
      handler,
      memorySize = 1024,
      tables,
      timeout = Duration.seconds(6),
      ...restProps
    } = props;

    const role = new iam.Role(this, `${id}LambdaExecutionRole`, {
      assumedBy: new iam.ServicePrincipal("lambda.amazonaws.com"),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName(
          "service-role/AWSLambdaVPCAccessExecutionRole"
        ),
      ],
      permissionsBoundary: props.iamPermissionsBoundary,
      path: props.iamPath,
      inlinePolicies: {
        LambdaPolicy: new iam.PolicyDocument({
          statements: [
            new iam.PolicyStatement({
              effect: iam.Effect.ALLOW,
              actions: ["ssm:GetParameter"],
              resources: ["*"],
            }),
            new iam.PolicyStatement({
              effect: iam.Effect.ALLOW,
              actions: [
                "logs:CreateLogGroup",
                "logs:CreateLogStream",
                "logs:PutLogEvents",
              ],
              resources: ["arn:aws:logs:*:*:*"],
            }),
            ...additionalPolicies,
          ],
        }),
      },
    });

    // TODO: test deploy and watch performance with this using lambda.Function vs lambda_nodejs.NodejsFunction
    this.lambda = new lambda_nodejs.NodejsFunction(this, id, {
      functionName: `${props.stackName}-${id}`,
      handler,
      runtime: lambda.Runtime.NODEJS_20_X,
      timeout,
      memorySize,
      role,
      bundling: {
        minify: true,
        sourceMap: true,
      },
      environment,
      ...restProps,
    });

    Object.entries(tables).forEach(([tableName, table]) => {
      new lambda.CfnEventSourceMapping(
        scope,
        `${id}${tableName}DynamoDBStreamEventSourceMapping`,
        {
          eventSourceArn: table.tableStreamArn,
          functionName: this.lambda.functionArn,
          startingPosition: "TRIM_HORIZON",
          maximumRetryAttempts: 2,
          enabled: true,
        }
      );
    });
  }
}
