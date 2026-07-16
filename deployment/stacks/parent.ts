import { Construct } from "constructs";
import {
  aws_ec2 as ec2,
  aws_iam as iam,
  aws_s3 as s3,
  Aws,
  CfnOutput,
  Stack,
  type StackProps,
} from "aws-cdk-lib";
import type { DeploymentConfigProperties } from "../deployment-config.ts";
import { createDataComponents } from "./data.ts";
import { createUiAuthComponents } from "./ui-auth.ts";
import { createUiComponents } from "./ui.ts";
import { createApiComponents } from "./api.ts";
import { deployFrontend } from "./deployFrontend.ts";
import { isLocalAwsEmulator } from "../local/util.ts";
import { createTopicsComponents } from "./topics.ts";
import { getSubnets } from "../utils/vpc.ts";

export class ParentStack extends Stack {
  constructor(
    scope: Construct,
    id: string,
    props: StackProps & DeploymentConfigProperties
  ) {
    const {
      isDev,
      secureCloudfrontDomainName,
      vpcName,
      vpcId,
      kafkaAuthorizedSubnetIds,
    } = props;

    super(scope, id, {
      ...props,
      terminationProtection: !isDev,
    });

    const commonProps = {
      scope: this,
      ...props,
      isDev,
    };

    const vpc = isLocalAwsEmulator
      ? ec2.Vpc.fromVpcAttributes(this, "Vpc", {
          vpcId: vpcId!,
          availabilityZones: ["us-east-1a"],
        })
      : ec2.Vpc.fromLookup(this, "Vpc", { vpcName });
    const kafkaAuthorizedSubnets = getSubnets(this, kafkaAuthorizedSubnetIds);

    const loggingBucket = s3.Bucket.fromBucketName(
      this,
      "LoggingBucket",
      `cms-cloud-${Aws.ACCOUNT_ID}-${Aws.REGION}`
    );

    const { tables } = createDataComponents({
      ...commonProps,
    });

    const { apiGatewayRestApiUrl, restApiId } = createApiComponents({
      ...commonProps,
      tables,
      vpc,
      kafkaAuthorizedSubnets,
    });

    if (isLocalAwsEmulator) {
      createUiAuthComponents({
        ...commonProps,
        applicationEndpointUrl: `http://localhost:${process.env.LOCAL_UI_PORT ?? "3000"}/`,
        restApiId,
        bootstrapUsersPassword:
          process.env.LOCAL_COGNITO_PASSWORD ?? "Password123!",
      });

      return;
    }

    const { applicationEndpointUrl, distribution, uiBucket } =
      createUiComponents({ ...commonProps, loggingBucket });

    const { userPoolDomainName, identityPoolId, userPoolId, userPoolClientId } =
      createUiAuthComponents({
        ...commonProps,
        applicationEndpointUrl,
        restApiId,
      });

    deployFrontend({
      ...commonProps,
      uiBucket,
      distribution,
      apiGatewayRestApiUrl,
      applicationEndpointUrl:
        secureCloudfrontDomainName ?? applicationEndpointUrl,
      identityPoolId,
      userPoolId,
      userPoolClientId,
      userPoolClientDomain: `${userPoolDomainName}.auth.${Aws.REGION}.amazoncognito.com`,
    });

    createTopicsComponents({
      ...commonProps,
      vpc,
      kafkaAuthorizedSubnets,
    });

    if (isDev) {
      applyDenyCreateLogGroupPolicy(this);
    }

    new CfnOutput(this, "CloudFrontUrl", {
      value: applicationEndpointUrl,
    });
  }
}

function applyDenyCreateLogGroupPolicy(stack: Stack) {
  const denyCreateLogGroupPolicy = {
    PolicyName: "DenyCreateLogGroup",
    PolicyDocument: {
      Version: "2012-10-17",
      Statement: [
        {
          Effect: "Deny",
          Action: "logs:CreateLogGroup",
          Resource: "*",
        },
      ],
    },
  };

  const findRole = (id: string) =>
    stack.node.tryFindChild(id)?.node.tryFindChild("Role") as iam.CfnRole;

  findRole(
    "Custom::S3AutoDeleteObjectsCustomResourceProvider"
  )?.addPropertyOverride("Policies", [denyCreateLogGroupPolicy]);

  findRole(
    "AWSCDK.TriggerCustomResourceProviderCustomResourceProvider"
  )?.addPropertyOverride("Policies.1", denyCreateLogGroupPolicy);

  stack.node
    .findAll()
    .filter((c) => c.node.id.startsWith("BucketNotificationsHandler"))
    .forEach((c) => {
      (
        c.node
          .tryFindChild("Role")
          ?.node.tryFindChild("Resource") as iam.CfnRole
      )?.addPropertyOverride("Policies", [denyCreateLogGroupPolicy]);
    });
}
