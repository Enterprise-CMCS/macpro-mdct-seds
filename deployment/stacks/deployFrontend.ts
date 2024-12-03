import { Construct } from "constructs";
import {
  aws_iam as iam,
  aws_cloudfront as cloudfront,
  Duration,
  aws_s3 as s3,
  aws_s3_deployment as s3_deployment,
  custom_resources as cr,
} from "aws-cdk-lib";
import path from "path";
import { execSync } from "node:child_process";

interface DeployFrontendProps {
  scope: Construct;
  stage: string;
  uiBucket: s3.Bucket;
  distribution: cloudfront.Distribution;
  apiGatewayRestApiUrl: string;
  applicationEndpointUrl: string;
  identityPoolId: string;
  userPoolId: string;
  userPoolClientId: string;
  userPoolClientDomain: string;
  iamPermissionsBoundary: iam.IManagedPolicy;
  iamPath: string;
  customResourceRole: iam.Role;
}

export function deployFrontend(props: DeployFrontendProps) {
  const {
    scope,
    stage,
    apiGatewayRestApiUrl,
    applicationEndpointUrl,
    identityPoolId,
    userPoolId,
    userPoolClientId,
    userPoolClientDomain,
  } = props;

  const reactAppPath = "./services/ui-src/";
  const buildOutputPath = path.join(reactAppPath, "build");
  const fullPath = path.resolve(reactAppPath);

  execSync("yarn run build", {
    cwd: fullPath,
    stdio: "inherit",
  });

  const deploymentRole = new iam.Role(scope, "BucketDeploymentRole", {
    assumedBy: new iam.ServicePrincipal("lambda.amazonaws.com"),
    path: props.iamPath,
    permissionsBoundary: props.iamPermissionsBoundary,
  });

  deploymentRole.addToPolicy(
    new iam.PolicyStatement({
      actions: [
        "s3:PutObject",
        "s3:PutObjectAcl",
        "s3:DeleteObject",
        "s3:DeleteObjectVersion",
        "s3:GetBucketLocation",
        "s3:GetObject",
        "s3:ListBucket",
        "s3:ListBucketVersions",
      ],
      resources: [props.uiBucket.bucketArn, `${props.uiBucket.bucketArn}/*`],
    })
  );

  deploymentRole.addToPolicy(
    new iam.PolicyStatement({
      actions: ["cloudfront:CreateInvalidation"],
      resources: ["*"],
    })
  );

  const deployWebsite = new s3_deployment.BucketDeployment(
    scope,
    "DeployWebsite",
    {
      sources: [s3_deployment.Source.asset(buildOutputPath)],
      destinationBucket: props.uiBucket,
      distribution: props.distribution,
      distributionPaths: ["/*"],
      prune: true,
      cacheControl: [
        s3_deployment.CacheControl.setPublic(),
        s3_deployment.CacheControl.maxAge(Duration.days(365)),
        s3_deployment.CacheControl.noCache(),
      ],
      role: deploymentRole,
    }
  );

  const deployTimeConfig = new s3_deployment.DeployTimeSubstitutedFile(
    scope,
    "DeployTimeConfig",
    {
      destinationBucket: props.uiBucket,
      destinationKey: "env-config.js",
      source: path.join("./deployment/stacks/", "env-config.template.js"),
      substitutions: {
        stage,
        apiGatewayRestApiUrl,
        applicationEndpointUrl,
        identityPoolId,
        userPoolId,
        userPoolClientId,
        userPoolClientDomain,
        timestamp: new Date().toISOString(),
      },
    }
  );

  deployTimeConfig.node.addDependency(deployWebsite);

  const invalidateEnvConfig = new cr.AwsCustomResource(
    scope,
    "InvalidateEnvConfig",
    {
      onCreate: {
        service: "CloudFront",
        action: "createInvalidation",
        parameters: {
          DistributionId: props.distribution.distributionId,
          InvalidationBatch: {
            Paths: {
              Quantity: 1,
              Items: ["/env-config.js"],
            },
            CallerReference: new Date().toISOString(),
          },
        },
        physicalResourceId: cr.PhysicalResourceId.of(
          `InvalidateEnvConfig-${new Date().toISOString()}`
        ),
      },
      onUpdate: {
        service: "CloudFront",
        action: "createInvalidation",
        parameters: {
          DistributionId: props.distribution.distributionId,
          InvalidationBatch: {
            Paths: {
              Quantity: 1,
              Items: ["/env-config.js"],
            },
            CallerReference: new Date().toISOString(),
          },
        },
        physicalResourceId: cr.PhysicalResourceId.of(
          `InvalidateEnvConfig-${new Date().toISOString()}`
        ),
      },
      role: props.customResourceRole,
      resourceType: "Custom::InvalidateEnvConfig",
    }
  );

  invalidateEnvConfig.node.addDependency(deployTimeConfig);
}
