#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { ParentStack } from "../lib/stacks/parent";
import { DeploymentConfig } from "../lib/config/deployment-config";
import {
  IamPathAspect,
  IamPermissionsBoundaryAspect,
} from "../lib/local-aspects";
import {
  SecretsManagerClient,
  GetSecretValueCommand,
  DescribeSecretCommand,
} from "@aws-sdk/client-secrets-manager";

export async function getSecret(
  secretId: string,
  region: string = "us-east-1"
): Promise<string> {
  const client = new SecretsManagerClient({ region });
  try {
    // Check if the secret is marked for deletion
    const describeCommand = new DescribeSecretCommand({ SecretId: secretId });

    const secretMetadata = await client.send(describeCommand);
    if (secretMetadata.DeletedDate) {
      throw new Error(
        `Secret ${secretId} is marked for deletion and will not be used.`
      );
    }

    const command = new GetSecretValueCommand({ SecretId: secretId });
    const data = await client.send(command);
    if (!data.SecretString) {
      throw `Secret ${secretId} has no SecretString field present in response`;
    }
    return data.SecretString;
  } catch (error: unknown) {
    throw new Error(`Failed to fetch secret ${secretId}: ${error}`);
  }
}

function validateEnvVariable(variableName: string): string {
  const value = process.env[variableName];
  if (!value) {
    throw new Error(
      `Environment variable ${variableName} is required but not set`
    );
  }
  return value;
}

async function main() {
  try {
    const app = new cdk.App({
      defaultStackSynthesizer: new cdk.DefaultStackSynthesizer(
        JSON.parse(await getSecret("cdkSynthesizerConfig"))
      ),
    });

    validateEnvVariable("REGION_A");

    const project = validateEnvVariable("PROJECT");
    cdk.Tags.of(app).add("PROJECT", project);

    const stage = app.node.tryGetContext("stage");
    cdk.Tags.of(app).add("STAGE", stage);

    const deploymentConfig = await DeploymentConfig.fetch({ project, stage });

    new ParentStack(app, `${project}-${stage}`, {
      ...deploymentConfig.config,
      env: {
        account: process.env.CDK_DEFAULT_ACCOUNT,
        region: process.env.CDK_DEFAULT_REGION,
      },
    });

    cdk.Aspects.of(app).add(
      new IamPermissionsBoundaryAspect(
        deploymentConfig.config.iamPermissionsBoundary
      )
    );
    cdk.Aspects.of(app).add(new IamPathAspect(deploymentConfig.config.iamPath));
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

main();
