#!/usr/bin/env node
import "source-map-support/register.js";
import {
  App,
  SecretValue,
  Stack,
  aws_iam as iam,
  aws_secretsmanager as secretsmanager,
  type StackProps,
} from "aws-cdk-lib";
import { Construct } from "constructs";

export class LocalPrerequisiteStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    new secretsmanager.Secret(this, "DefaultSecret", {
      secretName: `${process.env.PROJECT!}-default`, // pragma: allowlist-secret
      secretObjectValue: {
        vpcName: SecretValue.unsafePlainText("floci-dev"),
        brokerString: SecretValue.unsafePlainText("floci"),
        kafkaAuthorizedSubnetIds:
          SecretValue.unsafePlainText("subnet-default-a"),
      },
    });

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
    `${process.env.PROJECT!}-local-prerequisites`
  );
}

main();
