import { Construct } from "constructs";
import {
  Aws,
  aws_ec2 as ec2,
  aws_iam as iam,
  CfnOutput,
  Stack,
  StackProps,
} from "aws-cdk-lib";
import { DeploymentConfigProperties } from "../deployment-config";
import { createDataComponents } from "./data";
import { createUiAuthComponents } from "./ui-auth";
import { createUiComponents } from "./ui";
import { createApiComponents } from "./api";
import { sortSubnets } from "../utils/vpc";
import { deployFrontend } from "./deployFrontend";
import { createCustomResourceRole } from "./customResourceRole";
import { isLocalStack } from "../local/util";

export class ParentStack extends Stack {
  constructor(
    scope: Construct,
    id: string,
    props: StackProps & DeploymentConfigProperties
  ) {
    super(scope, id, props);

    const iamPermissionsBoundaryArn = `arn:aws:iam::${Aws.ACCOUNT_ID}:policy/cms-cloud-admin/developer-boundary-policy`
    const iamPath = "/delegatedadmin/developer/"

    const { vpcName } = props;

    const commonProps = {
      scope: this,
      ...props,
      iamPermissionsBoundary: iam.ManagedPolicy.fromManagedPolicyArn(
        this,
        "iamPermissionsBoundary",
        iamPermissionsBoundaryArn
      ),
      iamPath,
    };

    const vpc = ec2.Vpc.fromLookup(this, "Vpc", { vpcName });
    const privateSubnets = sortSubnets(vpc.privateSubnets).slice(0, 3);

    const { customResourceRole } = createCustomResourceRole({ ...commonProps });

    const { tables } = createDataComponents({
      ...commonProps,
      customResourceRole,
    });

    const { apiGatewayRestApiUrl, restApiId } = createApiComponents({
      ...commonProps,
      vpc,
      privateSubnets,
      tables
    });

    if (!isLocalStack) {
      const {
        applicationEndpointUrl,
        distribution,
        uiBucket,
      } = createUiComponents({ ...commonProps });

      const {
        userPoolDomainName,
        identityPoolId,
        userPoolId,
        userPoolClientId,
      } = createUiAuthComponents({
        ...commonProps,
        applicationEndpointUrl,
        restApiId,
        customResourceRole
      });

      deployFrontend({
        ...commonProps,
        uiBucket,
        distribution,
        apiGatewayRestApiUrl,
        applicationEndpointUrl,
        identityPoolId,
        userPoolId,
        userPoolClientId,
        userPoolClientDomain: `${userPoolDomainName}.auth.${this.region}.amazoncognito.com`,
        customResourceRole,
      });

      new CfnOutput(this, "CloudFrontUrl", {
        value: applicationEndpointUrl,
      });
    }
    new CfnOutput(this, "ApiUrl", {
      value: apiGatewayRestApiUrl,
    });
  }
}
