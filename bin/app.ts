#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { ParentStack } from "../lib/stacks/parent";
import { determineDeploymentConfig } from "../lib/config/deployment-config";
import { IamPathAspect } from "../lib/local-aspects/iam-path";
import { IamPermissionsBoundaryAspect } from "../lib/local-aspects/iam-permissions-boundary";
import { getSecret } from "../lib/utils/secrets-manager";

async function main() {
  try {
    const synthesizerConfig = await getSecret("cdkSynthesizerConfig");

    if (!synthesizerConfig) {
      console.error("no cdk synthesizer config");
      process.exit(1);
    }
    const app = new cdk.App({
      defaultStackSynthesizer: new cdk.DefaultStackSynthesizer(
        JSON.parse(synthesizerConfig)
      ),
    });

    const stage = app.node.getContext("stage");
    const config = await determineDeploymentConfig(stage);

    cdk.Tags.of(app).add("STAGE", stage);
    cdk.Tags.of(app).add("PROJECT", config.project);

    new ParentStack(app, `${config.project}-${stage}`, {
      ...config,
      env: {
        account: process.env.CDK_DEFAULT_ACCOUNT,
        region: process.env.CDK_DEFAULT_REGION,
      },
    });

    cdk.Aspects.of(app).add(
      new IamPermissionsBoundaryAspect(config.iamPermissionsBoundary)
    );
    cdk.Aspects.of(app).add(new IamPathAspect(config.iamPath));
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

main();
