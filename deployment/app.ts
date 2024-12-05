#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { ParentStack } from "./stacks/parent";
import { determineDeploymentConfig } from "./deployment-config";
import { getSecret } from "./utils/secrets-manager";
import { getDeploymentConfigParameters } from "./utils/systems-manager";

async function main() {
  try {
    const app = new cdk.App({
      defaultStackSynthesizer: new cdk.DefaultStackSynthesizer(
        JSON.parse((await getSecret("cdkSynthesizerConfig"))!)
      ),
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

    cdk.Tags.of(app).add("STAGE", stage);
    cdk.Tags.of(app).add("PROJECT", config.project);

    new ParentStack(app, `${config.project}-${stage}`, {
      ...config,
      env: {
        account: process.env.CDK_DEFAULT_ACCOUNT,
        region: process.env.CDK_DEFAULT_REGION,
      },
      deploymentConfigParameters,
    });
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

main();
