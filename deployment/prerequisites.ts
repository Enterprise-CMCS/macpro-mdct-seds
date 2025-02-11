#!/usr/bin/env node
import "source-map-support/register";
import {
  aws_apigateway as apigateway,
  aws_iam as iam,
  App,
  DefaultStackSynthesizer,
  Stack,
  StackProps,
  Tags,
} from "aws-cdk-lib";
import { CloudWatchLogsResourcePolicy } from "./constructs/cloudwatch-logs-resource-policy";
import { loadDefaultSecret } from "./deployment-config";
// import { getSecret } from "./utils/secrets-manager";
import { Construct } from "constructs";

interface PrerequisiteConfigProps {
  project: string;
  iamPath: string;
  iamPermissionsBoundaryArn: string;
}

export class PrerequisiteStack extends Stack {
  constructor(
    scope: Construct,
    id: string,
    props: StackProps & PrerequisiteConfigProps
  ) {
    super(scope, id, props);

    const {
      project,
      iamPermissionsBoundaryArn,
      iamPath,
    } = props;

    new CloudWatchLogsResourcePolicy(this, "logPolicy", { project });

    const cloudWatchRole = new iam.Role(
      this,
      "ApiGatewayRestApiCloudWatchRole",
      {
        assumedBy: new iam.ServicePrincipal("apigateway.amazonaws.com"),
        permissionsBoundary: iam.ManagedPolicy.fromManagedPolicyArn(
          this,
          "iamPermissionsBoundary",
          iamPermissionsBoundaryArn
        ),
        path: iamPath,
        managedPolicies: [
          iam.ManagedPolicy.fromAwsManagedPolicyName(
            "service-role/AmazonAPIGatewayPushToCloudWatchLogs"
          ),
        ],
      }
    );

    new apigateway.CfnAccount(
      this,
      "ApiGatewayRestApiAccount",
      {
        cloudWatchRoleArn: cloudWatchRole.roleArn,
      }
    );
  }
}

async function main() {
  const app = new App({
    defaultStackSynthesizer: new DefaultStackSynthesizer(
      {
        "deployRoleArn": "somethin",
        "fileAssetPublishingRoleArn": "somethin",
        "imageAssetPublishingRoleArn": "somethin",
        "cloudFormationExecutionRole": "somethin",
        "lookupRoleArn": "somethin",
        "qualifier": "somethins"
      }
    ),
  });

  Tags.of(app).add("PROJECT", "SEDS");

  const project = process.env.PROJECT!;
  new PrerequisiteStack(app, "seds-prerequisites", {
    project,
    ...(await loadDefaultSecret(project)),
    env: {
      account: process.env.CDK_DEFAULT_ACCOUNT,
      region: process.env.CDK_DEFAULT_REGION,
    },
  });
}

main();
