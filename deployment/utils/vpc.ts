import { Construct } from "constructs";
import { aws_ec2 as ec2 } from "aws-cdk-lib";

export function getSubnets(scope: Construct, subnetIds: string): ec2.ISubnet[] {
  return subnetIds
    .split(",")
    .map((subnetId) =>
      ec2.Subnet.fromSubnetId(scope, `Subnet-${subnetId}`, subnetId)
    );
}
