import { Construct } from "constructs";
import {
  Aws,
  aws_cloudfront as cloudfront,
  aws_iam as iam,
  aws_s3 as s3,
  CfnOutput,
  Stack,
  StackProps,
} from "aws-cdk-lib";
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

    const iamPermissionsBoundaryArn = `arn:aws:iam::${Aws.ACCOUNT_ID}:policy/cms-cloud-admin/developer-boundary-policy`
    const iamPath = "/delegatedadmin/developer/"

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

    let applicationEndpointUrl: string | undefined,
      distribution: cloudfront.Distribution | undefined,
      uiBucket: s3.Bucket | undefined,
      userPoolDomainName: string | undefined,
      identityPoolId: string | undefined,
      userPoolId: string | undefined,
      userPoolClientId: string | undefined,
      createAuthRole: ((restApiId: string) => void) | undefined = undefined;

    if (!isLocalStack) {
      ({
        applicationEndpointUrl,
        distribution,
        uiBucket,
      } = createUiComponents({ ...commonProps }));

      ({
        userPoolDomainName,
        identityPoolId,
        userPoolId,
        userPoolClientId,
        createAuthRole,
      } = createUiAuthComponents({
        ...commonProps,
        applicationEndpointUrl,
        customResourceRole,
      }));
    }

    const { apiGatewayRestApiUrl, restApiId } = createApiComponents({
      ...commonProps,
      userPoolId,
      userPoolClientId,
      tables,
    });

    if (!isLocalStack) {
      createAuthRole?.(restApiId)

      deployFrontend({
        ...commonProps,
        uiBucket: uiBucket!,
        distribution: distribution!,
        apiGatewayRestApiUrl,
        applicationEndpointUrl:
          secureCloudfrontDomainName || applicationEndpointUrl!,
        identityPoolId: identityPoolId!,
        userPoolId: userPoolId!,
        userPoolClientId: userPoolClientId!,
        userPoolClientDomain: `${userPoolDomainName}.auth.${this.region}.amazoncognito.com`,
        customResourceRole,
      });

      new CfnOutput(this, "CloudFrontUrl", {
        value: applicationEndpointUrl!,
      });
    }

    new CfnOutput(this, "ApiUrl", {
      value: apiGatewayRestApiUrl,
    });
  }
}
