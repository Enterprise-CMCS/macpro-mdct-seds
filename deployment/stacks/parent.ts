import { Construct } from "constructs";
import {
  aws_ec2 as ec2,
  aws_iam as iam,
  aws_ssm as ssm,
  CfnOutput,
  Stack,
  StackProps,
} from "aws-cdk-lib";
import { CloudWatchLogsResourcePolicy } from "../constructs/cloudwatch-logs-resource-policy";
import { DeploymentConfigProperties } from "../deployment-config";
import { createDataComponents } from "./data";
import { createUiAuthComponents } from "./ui-auth";
import { createUiComponents } from "./ui";
import { createApiComponents } from "./api";
import { sortSubnets } from "../utils/vpc";

export class ParentStack extends Stack {
  constructor(
    scope: Construct,
    id: string,
    props: StackProps & DeploymentConfigProperties
  ) {
    super(scope, id, props);

    const {
      stage,
      project,
      isDev,
      vpcName,
      bootstrapUsersPasswordArn,
      oktaMetadataUrl,
      brokerString,
      iamPermissionsBoundaryArn,
      iamPath,
    } = props;

    const commonProps = {
      scope: this,
      stage,
      project,
      isDev,
      iamPermissionsBoundary: iam.ManagedPolicy.fromManagedPolicyArn(
        this,
        "iamPermissionsBoundary",
        iamPermissionsBoundaryArn
      ),
      iamPath,
    };

    const vpc = ec2.Vpc.fromLookup(this, "Vpc", { vpcName });
    const privateSubnets = sortSubnets(vpc.privateSubnets).slice(0, 3);

    if (!isDev) {
      new CloudWatchLogsResourcePolicy(this, "logPolicy", { project });
    }

    const { seedDataFunctionName, tables } = createDataComponents({
      ...commonProps,
    });

    const { apiGatewayRestApiUrl, restApiId } = createApiComponents({
      ...commonProps,
      vpc,
      privateSubnets,
      tables,
      brokerString,
    });

    const {
      applicationEndpointUrl,
      cloudfrontDistributionId,
      s3BucketName,
    } = createUiComponents({
      ...commonProps,
    });

    const {
      userPoolDomain,
      bootstrapUsersFunction,
      identityPool,
      userPool,
      userPoolClient,
    } = createUiAuthComponents({
      ...commonProps,
      oktaMetadataUrl,
      applicationEndpointUrl,
      restApiId,
      bootstrapUsersPasswordArn,
    });

    new ssm.StringParameter(this, "DeploymentOutput", {
      parameterName: `/${project}/${stage}/deployment-output`,
      stringValue: JSON.stringify({
        apiGatewayRestApiUrl,
        applicationEndpointUrl,
        s3BucketName,
        cloudfrontDistributionId,
        identityPoolId: identityPool.ref,
        userPoolId: userPool.userPoolId,
        userPoolClientId: userPoolClient.userPoolClientId,
        userPoolClientDomain: `${userPoolDomain.domainName}.auth.${this.region}.amazoncognito.com`,
        bootstrapUsersFunctionName: bootstrapUsersFunction?.functionName,
        seedDataFunctionName,
      }),
      description: `Deployment output for the ${stage} environment.`,
    });

    new CfnOutput(this, "CloudFrontUrl", {
      value: applicationEndpointUrl,
    });
  }
}
