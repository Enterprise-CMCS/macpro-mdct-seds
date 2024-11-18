#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { ParentStack } from "./stacks/parent";
import { determineDeploymentConfig } from "./deployment-config";
import { IamPathAspect } from "./local-aspects/iam-path";
import { IamPermissionsBoundaryAspect } from "./local-aspects/iam-permissions-boundary";
import { getSecret } from "./utils/secrets-manager";

async function main() {
  try {
    const app = new cdk.App({
      defaultStackSynthesizer: new cdk.DefaultStackSynthesizer(
        JSON.parse((await getSecret("cdkSynthesizerConfig"))!)
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

    // TODO: try without aspects and see what is required to set pemissions boundary and path within CDK rather than in aspects
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
