#!/usr/bin/env node
import "source-map-support/register.js";
import { App, Stack, aws_iam as iam, type StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";

export class LocalPrerequisiteStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    new iam.ManagedPolicy(this, "ADORestrictionPolicy", {
      managedPolicyName: "ADO-Restriction-Policy",
      statements: [
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: ["*"],
          resources: ["*"],
        }),
      ],
    });

    new iam.ManagedPolicy(this, "CMSApprovedAWSServicesPolicy", {
      managedPolicyName: "CMSApprovedAWSServices",
      statements: [
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: ["*"],
          resources: ["*"],
        }),
      ],
    });
  }
}

async function main() {
  const app = new App();

  new LocalPrerequisiteStack(
    app,
    `${process.env.PROJECT!}-floci-prerequisites`
  );
}

main();
