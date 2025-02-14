#!/usr/bin/env node
import "source-map-support/register";
import { App, Stack, StackProps, Tags, aws_ec2 as ec2 } from "aws-cdk-lib";
import { Construct } from "constructs";

export class LocalPrerequisiteStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const mdctVpcEastDev = new ec2.Vpc(this, "MdctVpcEastDev", {
      ipAddresses: ec2.IpAddresses.cidr("10.0.0.0/16"),
      enableDnsSupport: true,
      enableDnsHostnames: false,
      subnetConfiguration: [],
    });

    Tags.of(mdctVpcEastDev).add("Name", "mdct-vpc-east-dev");

    const mdctSubnet1 = new ec2.Subnet(this, "MdctSubnet1", {
      vpcId: mdctVpcEastDev.vpcId,
      availabilityZone: "us-east-1a",
      cidrBlock: "10.0.1.0/24",
    });

    Tags.of(mdctSubnet1).add("Name", "mdct-subnet-1");
  }
}

async function main() {
  const app = new App();

  new LocalPrerequisiteStack(app, "seds-local-prerequisites");
}

main();
