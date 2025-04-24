import { Construct } from "constructs";
import { aws_iam as iam } from "aws-cdk-lib";

interface CreateCustomResourceRoleProps {
  scope: Construct;
}

export function createCustomResourceRole(props: CreateCustomResourceRoleProps) {
  const { scope } = props;

  const customResourceRole = new iam.Role(scope, "CustomResourceRole", {
    assumedBy: new iam.ServicePrincipal("lambda.amazonaws.com"),
  });

  customResourceRole.addToPolicy(
    new iam.PolicyStatement({
      actions: ["lambda:InvokeFunction"],
      resources: ["*"],
    })
  );

  customResourceRole.addToPolicy(
    new iam.PolicyStatement({
      actions: [
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:PutLogEvents",
        "cloudfront:CreateInvalidation",
      ],
      resources: ["*"],
    })
  );

  return { customResourceRole };
}
