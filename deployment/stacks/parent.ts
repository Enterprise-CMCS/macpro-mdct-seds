import { Construct } from "constructs";
import {
  aws_ec2 as ec2,
  aws_iam as iam,
  aws_s3 as s3,
  Aws,
  CfnOutput,
  Stack,
  StackProps,
} from "aws-cdk-lib";
import { DeploymentConfigProperties } from "../deployment-config.js";
import { createDataComponents } from "./data.js";
import { createUiAuthComponents } from "./ui-auth.js";
import { createUiComponents } from "./ui.js";
import { createApiComponents } from "./api.js";
import { deployFrontend } from "./deployFrontend.js";
import { isLocalStack } from "../local/util.js";
import { createTopicsComponents } from "./topics.js";
import { getSubnets } from "../utils/vpc.js";

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

    const vpc = ec2.Vpc.fromLookup(this, "Vpc", { vpcName });
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

    if (isLocalStack) {
      /*
       * For local dev, the LocalStack container will host the database and API.
       * The UI will self-host, so we don't need to tell CDK anything about it.
       * Also, we skip authorization locally. So we don't set up Cognito,
       * or configure the API to interact with it. Therefore, we're done.
       */
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

  const applyPolicy = (role: iam.CfnRole | undefined, useIndex = false) => {
    if (role) {
      const prop = "Policies.1"; // useIndex ? "Policies.1" : "Policies";
      const value = useIndex
        ? denyCreateLogGroupPolicy
        : [denyCreateLogGroupPolicy];
      role.addPropertyOverride(prop, value);
    }
  };

  // S3 Auto Delete Objects provider
  const s3Provider = stack.node.tryFindChild(
    "Custom::S3AutoDeleteObjectsCustomResourceProvider"
  );
  applyPolicy(s3Provider?.node.tryFindChild("Role") as iam.CfnRole);

  // Bucket Notifications handlers
  stack.node
    .findAll()
    .filter((c) => c.node.id.startsWith("BucketNotificationsHandler"))
    .forEach((c) => {
      applyPolicy(
        c.node
          .tryFindChild("Role")
          ?.node.tryFindChild("Resource") as iam.CfnRole
      );
    });

  // Trigger provider (appends to existing policies)
  const triggerProvider = stack.node.tryFindChild(
    "AWSCDK.TriggerCustomResourceProviderCustomResourceProvider"
  );
  applyPolicy(triggerProvider?.node.tryFindChild("Role") as iam.CfnRole, true);
}
