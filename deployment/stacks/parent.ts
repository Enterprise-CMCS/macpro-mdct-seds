import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { CloudWatchLogsResourcePolicy } from "../constructs/cloudwatch-logs-resource-policy";
import { DeploymentConfigProperties } from "../deployment-config";
import { ApiStack } from "./api";
import { UiAuthStack } from "./ui-auth";
import { UiStack } from "./ui";
import { DatabaseStack } from "./data";

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
      iamPermissionsBoundary: cdk.aws_iam.ManagedPolicy.fromManagedPolicyArn(
        this,
        "iamPermissionsBoundary",
        props.iamPermissionsBoundaryArn
      ),
      iamPath: props.iamPath,
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

    const dataStack = new DatabaseStack(this, "database", {
      ...commonProps,
      stack: "database",
    });

    const apiStack = new ApiStack(this, "api", {
      ...commonProps,
      stack: "api",
      tables: dataStack.tables,
      vpc,
      privateSubnets,
      brokerString: props.brokerString,
    });

    const uiStack = new UiStack(this, "ui", {
      ...commonProps,
      stack: "ui",
      restrictToVpn: false,
    });

    const authStack = new UiAuthStack(this, "ui-auth", {
      ...commonProps,
      stack: "ui-auth",
      restApiId: apiStack.restApiId,
      applicationEndpointUrl: uiStack.applicationEndpointUrl,
      oktaMetadataUrl: props.oktaMetadataUrl,
      bootstrapUsersPasswordArn: props.bootstrapUsersPasswordArn,
    });

    new cdk.aws_ssm.StringParameter(this, "DeploymentOutput", {
      parameterName: `/${props.project}/${props.stage}/deployment-output`,
      stringValue: JSON.stringify({
        apiGatewayRestApiUrl: apiStack.url,
        applicationEndpointUrl: uiStack.applicationEndpointUrl,
        s3BucketName: uiStack.bucket.bucketName,
        cloudfrontDistributionId: uiStack.distribution.distributionId,
        identityPoolId: authStack.identityPool.ref,
        userPoolId: authStack.userPool.userPoolId,
        userPoolClientId: authStack.userPoolClient.userPoolClientId,
        userPoolClientDomain: `${authStack.userPoolDomain.domainName}.auth.${this.region}.amazoncognito.com`,
        bootstrapUsersFunctionName:
          authStack.bootstrapUsersFunction?.functionName,
        seedDataFunctionName: dataStack.seedDataFunction?.functionName,
      }),
      description: `Deployment output for the ${props.stage} environment.`,
    });

    new cdk.aws_ssm.StringParameter(this, "DeploymentConfig", {
      parameterName: `/${props.project}/${props.stage}/deployment-config`,
      stringValue: JSON.stringify(props),
      description: `Deployment config for the ${props.stage} environment.`,
    });

    new cdk.CfnOutput(this, "CloudFrontUrl", {
      value: uiStack.distribution.distributionDomainName,
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
