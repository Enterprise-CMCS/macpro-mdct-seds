import { Construct } from "constructs";
import * as ec2 from "aws-cdk-lib/aws-ec2";

export function getSubnets(
  scope: Construct,
  subnetIds: string
): ec2.ISubnet[] {
  return subnetIds.split(',').map(subnetId =>
    ec2.Subnet.fromSubnetId(scope, `Subnet-${subnetId}`, subnetId)
  )
}
