#!/usr/bin/env node
import "source-map-support/register";
import {
  App,
  aws_apigateway as apigateway,
  aws_iam as iam,
  Aws,
  DefaultStackSynthesizer,
  Stack,
  StackProps,
  Tags,
} from "aws-cdk-lib";
import { CloudWatchLogsResourcePolicy } from "./constructs/cloudwatch-logs-resource-policy";
import { loadDefaultSecret } from "./deployment-config";
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

    const { project, iamPermissionsBoundaryArn, iamPath } = props;

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

    new apigateway.CfnAccount(this, "ApiGatewayRestApiAccount", {
      cloudWatchRoleArn: cloudWatchRole.roleArn,
    });
  }
}

async function main() {
  const app = new App({
    defaultStackSynthesizer: new DefaultStackSynthesizer({
      deployRoleArn: `arn:aws:iam::${Aws.ACCOUNT_ID}:role/delegatedadmin/developer/cdk-hnb659fds-deploy-role-${Aws.ACCOUNT_ID}-us-east-1`,
      fileAssetPublishingRoleArn: `arn:aws:iam::${Aws.ACCOUNT_ID}:role/delegatedadmin/developer/cdk-hnb659fds-file-publishing-role-${Aws.ACCOUNT_ID}-us-east-1`,
      imageAssetPublishingRoleArn: `arn:aws:iam::${Aws.ACCOUNT_ID}:role/delegatedadmin/developer/cdk-hnb659fds-image-publishing-role-${Aws.ACCOUNT_ID}-us-east-1`,
      cloudFormationExecutionRole: `arn:aws:iam::${Aws.ACCOUNT_ID}:role/delegatedadmin/developer/cdk-hnb659fds-cfn-exec-role-${Aws.ACCOUNT_ID}-us-east-1`,
      lookupRoleArn: `arn:aws:iam::${Aws.ACCOUNT_ID}:role/delegatedadmin/developer/cdk-hnb659fds-lookup-role-${Aws.ACCOUNT_ID}-us-east-1`,
      qualifier: "hnb659fds",
    }),
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
