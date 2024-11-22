import { aws_ec2 as ec2 } from "aws-cdk-lib";

function getSubnetSize(cidrBlock: string): number {
  const subnetMask = parseInt(cidrBlock.split("/")[1], 10);
  return Math.pow(2, 32 - subnetMask);
}

export function sortSubnets(subnets: ec2.ISubnet[]): ec2.ISubnet[] {
  return subnets.sort((a, b) => {
    const sizeA = getSubnetSize(a.ipv4CidrBlock);
    const sizeB = getSubnetSize(b.ipv4CidrBlock);

    if (sizeA !== sizeB) {
      return sizeB - sizeA; // Sort by size in decreasing order
    }

    return a.subnetId.localeCompare(b.subnetId); // Sort by name if sizes are equal
  });
}
