// This file is managed by macpro-mdct-core so if you'd like to change it let's do it there
import { Construct } from "constructs";
import {
  NodejsFunction,
  type NodejsFunctionProps,
} from "aws-cdk-lib/aws-lambda-nodejs";
import { Duration, RemovalPolicy, aws_s3 as s3 } from "aws-cdk-lib";
import { Runtime } from "aws-cdk-lib/aws-lambda";
import { PolicyStatement } from "aws-cdk-lib/aws-iam";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import { LogGroup, RetentionDays } from "aws-cdk-lib/aws-logs";
import { isMiniStack } from "../local/util.ts";
import { DynamoDBTable } from "./dynamodb-table.ts";
import { createHash } from "node:crypto";

const miniStackEndpointFromLambda = `http://host.docker.internal:${process.env.MINISTACK_PORT ?? "4566"}`;

interface LambdaProps extends Partial<NodejsFunctionProps> {
  path?: string;
  method?: string;
  stackName: string;
  api?: apigateway.RestApi;
  additionalPolicies?: PolicyStatement[];
  tables?: DynamoDBTable[];
  buckets?: s3.IBucket[];
  isDev: boolean;
}

export class Lambda extends Construct {
  public readonly lambda: NodejsFunction;

  constructor(scope: Construct, id: string, props: LambdaProps) {
    super(scope, id);

    const {
      timeout = Duration.seconds(6),
      memorySize = 1024,
      api,
      path,
      method,
      additionalPolicies = [],
      tables = [],
      buckets = [],
      stackName,
      isDev,
      retryAttempts,
      environment,
      bundling,
      ...restProps
    } = props;

    const logGroup = new LogGroup(this, `${id}LogGroup`, {
      logGroupName: `/aws/lambda/${stackName}-${id}`,
      removalPolicy: isDev ? RemovalPolicy.DESTROY : RemovalPolicy.RETAIN,
      retention: RetentionDays.THREE_YEARS, // exceeds the 30 month requirement
    });

    const defaultBundling = {
      assetHash: createHash("sha256")
        .update(`${Date.now()}-${id}`)
        .digest("hex"),
      minify: true,
      sourceMap: true,
      nodeModules: ["jsdom"],
    };
    const miniStackDefaultBundling = {
      ...defaultBundling,
      commandHooks: {
        beforeBundling() {
          return [];
        },
        beforeInstall() {
          return [];
        },
        afterBundling(inputDir: string, outputDir: string): string[] {
          return [
            `cp ${inputDir}/node_modules/jsdom/lib/jsdom/living/xhr/xhr-sync-worker.js ${outputDir}/xhr-sync-worker.js`,
          ];
        },
      },
    };
    const resolvedBundling = isMiniStack
      ? {
          ...(bundling ?? miniStackDefaultBundling),
          bundleAwsSDK: true,
          externalModules: [],
          nodeModules: undefined,
        }
      : (bundling ?? defaultBundling);

    this.lambda = new NodejsFunction(this, id, {
      functionName: `${stackName}-${id}`,
      runtime: Runtime.NODEJS_22_X,
      timeout,
      memorySize,
      bundling: resolvedBundling,
      logGroup,
      ...(isMiniStack ? {} : { retryAttempts }),
      environment: {
        ...(isMiniStack
          ? { AWS_ENDPOINT_URL: miniStackEndpointFromLambda }
          : {}),
        ...environment,
      },
      ...restProps,
    });

    for (const stmt of additionalPolicies) {
      this.lambda.addToRolePolicy(stmt);
    }

    if (api && path && method) {
      const resource = api.root.resourceForPath(path);
      resource.addMethod(
        method,
        new apigateway.LambdaIntegration(this.lambda),
        {
          authorizationType: isMiniStack
            ? undefined
            : apigateway.AuthorizationType.IAM,
        }
      );
      if (isMiniStack && !resource.node.tryFindChild("OPTIONS")) {
        resource.addMethod(
          "OPTIONS",
          new apigateway.MockIntegration({
            integrationResponses: [
              {
                statusCode: "200",
                responseParameters: {
                  "method.response.header.Access-Control-Allow-Headers":
                    "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'",
                  "method.response.header.Access-Control-Allow-Methods":
                    "'OPTIONS,GET,POST,PUT,PATCH,DELETE'",
                  "method.response.header.Access-Control-Allow-Origin": "'*'",
                },
              },
            ],
            passthroughBehavior: apigateway.PassthroughBehavior.NEVER,
            requestTemplates: {
              "application/json": '{"statusCode": 200}',
            },
          }),
          {
            authorizationType: undefined,
            methodResponses: [
              {
                statusCode: "200",
                responseParameters: {
                  "method.response.header.Access-Control-Allow-Headers": true,
                  "method.response.header.Access-Control-Allow-Methods": true,
                  "method.response.header.Access-Control-Allow-Origin": true,
                },
              },
            ],
          }
        );
      }
    }

    for (const ddbTable of tables) {
      ddbTable.table.grantReadWriteData(this.lambda);
      if (ddbTable.table.tableStreamArn) {
        ddbTable.table.grantStreamRead(this.lambda);
      }
    }

    for (const bucket of buckets) {
      bucket.grantReadWrite(this.lambda);
    }
  }
}
