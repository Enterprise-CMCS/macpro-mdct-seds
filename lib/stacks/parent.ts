import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { CloudWatchLogsResourcePolicy } from "../local-constructs/cloudwatch-logs-resource-policy";

import { DeploymentConfigProperties } from "../config/deployment-config";
import * as Stacks from "../stacks";

export class ParentStack extends cdk.Stack {
  constructor(
    scope: Construct,
    id: string,
    props: cdk.StackProps & DeploymentConfigProperties
  ) {
    super(scope, id, props);

    const commonProps = {
      project: props.project,
      stage: props.stage,
      isDev: props.isDev,
    };

    const vpc = cdk.aws_ec2.Vpc.fromLookup(this, "Vpc", {
      vpcName: props.vpcName,
    });
    const privateSubnets = sortSubnets(vpc.privateSubnets).slice(0, 3);

    if (!props.isDev) {
      new CloudWatchLogsResourcePolicy(this, "logPolicy", {
        project: props.project,
      });
    }

    const dataStack = new Stacks.DatabaseStack(this, "database", {
      ...commonProps,
      stack: "database",
    });

    const apiStack = new Stacks.ApiStack(this, "api", {
      ...commonProps,
      stack: "api",
      tables: dataStack.tables,
      vpc,
      privateSubnets,
    });

    new Stacks.StreamFunctionsStack(this, "stream-functions", {
      ...commonProps,
      stack: "stream-functions",
    });

    new Stacks.UiAuthStack(this, "ui-auth", {
      ...commonProps,
      stack: "ui-auth",
      api: apiStack.api,
    });

    new Stacks.UiStack(this, "ui", {
      ...commonProps,
      stack: "ui",
      restrictToVpn: false,
    });

    new cdk.aws_ssm.StringParameter(this, "DeploymentOutput", {
      parameterName: `/${props.project}/${props.stage}/deployment-output`,
      stringValue: JSON.stringify({
        apiGatewayRestApiUrl: apiStack.api.url,
        // applicationEndpointUrl: ui.applicationEndpointUrl,
        // s3BucketName: ui.bucket.bucketName,
        // cloudfrontDistributionId: ui.distribution.distributionId,
      }),
      description: `Deployment output for the ${props.stage} environment.`,
    });

    new cdk.aws_ssm.StringParameter(this, "DeploymentConfig", {
      parameterName: `/${props.project}/${props.stage}/deployment-config`,
      stringValue: JSON.stringify(props),
      description: `Deployment config for the ${props.stage} environment.`,
    });
  }
}

function getSubnetSize(cidrBlock: string): number {
  const subnetMask = parseInt(cidrBlock.split("/")[1], 10);
  return Math.pow(2, 32 - subnetMask);
}

function sortSubnets(subnets: cdk.aws_ec2.ISubnet[]): cdk.aws_ec2.ISubnet[] {
  return subnets.sort((a, b) => {
    const sizeA = getSubnetSize(a.ipv4CidrBlock);
    const sizeB = getSubnetSize(b.ipv4CidrBlock);

    if (sizeA !== sizeB) {
      return sizeB - sizeA; // Sort by size in decreasing order
    }

    return a.subnetId.localeCompare(b.subnetId); // Sort by name if sizes are equal
  });
}
