import { Construct } from "constructs";
import {
  NodejsFunction,
  NodejsFunctionProps,
} from "aws-cdk-lib/aws-lambda-nodejs";
import { Duration } from "aws-cdk-lib";
import { Runtime } from "aws-cdk-lib/aws-lambda";
import {
  Effect,
  IManagedPolicy,
  ManagedPolicy,
  PolicyDocument,
  PolicyStatement,
  Role,
  ServicePrincipal,
} from "aws-cdk-lib/aws-iam";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";

interface LambdaProps extends Partial<NodejsFunctionProps> {
  handler: string;
  timeout?: Duration;
  memorySize?: number;
  brokerString?: string;
  path?: string;
  method?: string;
  stackName: string;
  tables: { [name: string]: dynamodb.Table };
  api: apigateway.RestApi;
  additionalPolicies?: PolicyStatement[];
  iamPermissionsBoundary: IManagedPolicy;
  iamPath: string;
}

export class Lambda extends Construct {
  public readonly lambda: NodejsFunction;

  constructor(scope: Construct, id: string, props: LambdaProps) {
    super(scope, id);

    const {
      handler,
      timeout = Duration.seconds(6),
      memorySize = 1024,
      brokerString = "",
      environment = {},
      path,
      method,
      additionalPolicies = [],
      ...restProps
    } = props;

    const role = new Role(this, `${id}LambdaExecutionRole`, {
      assumedBy: new ServicePrincipal("lambda.amazonaws.com"),
      managedPolicies: [
        ManagedPolicy.fromAwsManagedPolicyName(
          "service-role/AWSLambdaVPCAccessExecutionRole"
        ),
      ],
      permissionsBoundary: props.iamPermissionsBoundary,
      path: props.iamPath,
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
            ...additionalPolicies,
          ],
        }),
      },
    });

    // TODO: test deploy and watch performance with this using lambda.Function vs lambda_nodejs.NodejsFunction
    this.lambda = new NodejsFunction(this, id, {
      functionName: `${props.stackName}-${id}`,
      handler,
      runtime: Runtime.NODEJS_20_X,
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
