import { Construct } from "constructs";
import { Aws, aws_iam as iam, CfnOutput, Stack, StackProps } from "aws-cdk-lib";
import { DeploymentConfigProperties } from "../deployment-config";
import { createDataComponents } from "./data";
import { createUiAuthComponents } from "./ui-auth";
import { createUiComponents } from "./ui";
import { createApiComponents } from "./api";
import { deployFrontend } from "./deployFrontend";
import { createCustomResourceRole } from "./customResourceRole";
import { isLocalStack } from "../local/util";

export class ParentStack extends Stack {
  constructor(
    scope: Construct,
    id: string,
    props: StackProps & DeploymentConfigProperties
  ) {
    const { isDev, secureCloudfrontDomainName } = props;

    super(scope, id, {
      ...props,
      terminationProtection: !isDev,
    });

    const iamPermissionsBoundaryArn = `arn:aws:iam::${Aws.ACCOUNT_ID}:policy/cms-cloud-admin/developer-boundary-policy`;
    const iamPath = "/delegatedadmin/developer/";

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

    const { customResourceRole } = createCustomResourceRole({ ...commonProps });

    const { tables } = createDataComponents({
      ...commonProps,
      customResourceRole,
    });

    if (isLocalStack) {
      createApiComponents({
        ...commonProps,
        tables,
      });
      return;
    }

    const { applicationEndpointUrl, distribution, uiBucket } =
      createUiComponents({
        ...commonProps,
      });

    const {
      userPoolDomainName,
      identityPoolId,
      userPoolId,
      userPoolClientId,
      createAuthRole,
    } = createUiAuthComponents({
      ...commonProps,
      applicationEndpointUrl,
      customResourceRole,
    });

    const { apiGatewayRestApiUrl, restApiId } = createApiComponents({
      ...commonProps,
      userPoolId,
      userPoolClientId,
      tables,
    });

    createAuthRole(restApiId);

    deployFrontend({
      ...commonProps,
      uiBucket,
      distribution,
      apiGatewayRestApiUrl,
      applicationEndpointUrl:
        secureCloudfrontDomainName || applicationEndpointUrl,
      identityPoolId,
      userPoolId,
      userPoolClientId,
      userPoolClientDomain: `${userPoolDomainName}.auth.${Aws.REGION}.amazoncognito.com`,
      customResourceRole,
    });

    new CfnOutput(this, "CloudFrontUrl", {
      value: applicationEndpointUrl,
    });
  }
}
