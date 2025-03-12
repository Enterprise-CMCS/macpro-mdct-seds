import { Construct } from "constructs";
import { aws_ec2 as ec2 } from "aws-cdk-lib";

export function getSubnets(scope: Construct, subnetIds: string) {
  if (!subnetIds) {
    return undefined;
  } else {
    return subnetIds
      .split(",")
      .map((subnetId) =>
        ec2.Subnet.fromSubnetId(scope, `Subnet-${subnetId}`, subnetId)
      );
  }
}
