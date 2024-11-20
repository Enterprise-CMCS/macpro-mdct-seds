import { Construct } from "constructs";
import { CfnResourcePolicy } from "aws-cdk-lib/aws-logs";
import { Stack, aws_iam as iam } from "aws-cdk-lib";

interface CloudWatchLogsResourcePolicyProps {
  readonly project: string;
}

export class CloudWatchLogsResourcePolicy extends Construct {
  public readonly policy: CfnResourcePolicy;

  constructor(
    scope: Construct,
    id: string,
    props: CloudWatchLogsResourcePolicyProps
  ) {
    super(scope, id);
    const stack = Stack.of(this);

    const policyDocument = new iam.PolicyDocument({
      statements: [
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          principals: [new iam.ServicePrincipal("delivery.logs.amazonaws.com")],
          actions: ["logs:CreateLogStream", "logs:PutLogEvents"],
          resources: [
            `arn:aws:logs:*:${stack.account}:log-group:aws-waf-logs-*`,
            `arn:aws:logs:*:${stack.account}:log-group:/aws/http-api/*`,
            `arn:aws:logs:*:${stack.account}:log-group:/aws/vendedlogs/*`,
          ],
          conditions: {
            StringEquals: { "aws:SourceAccount": stack.account },
            ArnLike: {
              "aws:SourceArn": `arn:aws:logs:${stack.region}:${stack.account}:*`,
            },
          },
        }),
      ],
    });

    policyDocument.validateForResourcePolicy();

    this.policy = new CfnResourcePolicy(
      this,
      `CentralizedCloudWatchLogsResourcePolicy`,
      {
        policyName: `${props.project}-centralized-logs-policy-${id}`,
        policyDocument: policyDocument.toJSON(),
      }
    );
  }
}
