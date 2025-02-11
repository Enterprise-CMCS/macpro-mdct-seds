#!/usr/bin/env node
import "source-map-support/register";
import { App, DefaultStackSynthesizer, Tags } from "aws-cdk-lib";
import { EmptyParentStack } from "./stacks/empty/parent";
import { ImportsIncludedParentStack } from "./stacks/imports_included/parent";
import { ParentStack } from "./stacks/parent";
import { determineDeploymentConfig } from "./deployment-config";
import { getDeploymentConfigParameters } from "./utils/systems-manager";

async function main() {
  const app = new App({
    defaultStackSynthesizer: new DefaultStackSynthesizer({
      deployRoleArn:
        "arn:${AWS::Partition}:iam::${AWS::AccountId}:role/delegatedadmin/developer/cdk-${Qualifier}-deploy-role-${AWS::AccountId}-${AWS::Region}",
      fileAssetPublishingRoleArn:
        "arn:${AWS::Partition}:iam::${AWS::AccountId}:role/delegatedadmin/developer/cdk-${Qualifier}-file-publishing-role-${AWS::AccountId}-${AWS::Region}",
      imageAssetPublishingRoleArn:
        "arn:${AWS::Partition}:iam::${AWS::AccountId}:role/delegatedadmin/developer/cdk-${Qualifier}-image-publishing-role-${AWS::AccountId}-${AWS::Region}",
      cloudFormationExecutionRole:
        "arn:${AWS::Partition}:iam::${AWS::AccountId}:role/delegatedadmin/developer/cdk-${Qualifier}-cfn-exec-role-${AWS::AccountId}-${AWS::Region}",
      lookupRoleArn:
        "arn:${AWS::Partition}:iam::${AWS::AccountId}:role/delegatedadmin/developer/cdk-${Qualifier}-lookup-role-${AWS::AccountId}-${AWS::Region}",
      qualifier: "hnb659fds",
    }),
  });

  const stage = app.node.getContext("stage");
  const config = await determineDeploymentConfig(stage);

  const parametersToFetch = {
    cloudfrontCertificateArn: {
      name: "cloudfront/certificateArn",
      useDefault: true,
    },
    cloudfrontDomainName: {
      name: "cloudfront/domainName",
      useDefault: false,
    },
    vpnIpSetArn: { name: "vpnIpSetArn", useDefault: true },
    vpnIpv6SetArn: { name: "vpnIpv6SetArn", useDefault: true },
    hostedZoneId: { name: "route53/hostedZoneId", useDefault: true },
    domainName: { name: "route53/domainName", useDefault: true },
  };

  const deploymentConfigParameters = await getDeploymentConfigParameters(
    parametersToFetch,
    stage
  );

  Tags.of(app).add("STAGE", stage);
  Tags.of(app).add("PROJECT", config.project);

  let correctParentStack;
  if (process.env.IMPORT_VARIANT == "empty") {
    correctParentStack = EmptyParentStack;
  } else if (process.env.IMPORT_VARIANT == "imports_included") {
    correctParentStack = ImportsIncludedParentStack;
  } else {
    correctParentStack = ParentStack;
  }
  new correctParentStack(app, `${config.project}-${stage}`, {
    ...config,
    env: {
      account: process.env.CDK_DEFAULT_ACCOUNT,
      region: process.env.CDK_DEFAULT_REGION,
    },
    deploymentConfigParameters,
  });
}

main();
