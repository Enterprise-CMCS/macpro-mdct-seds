#!/usr/bin/env node
import "source-map-support/register";
import {
  App,
  DefaultStackSynthesizer,
  Stack,
  StackProps,
} from "aws-cdk-lib";
// import { getSecret } from "./utils/secrets-manager";
import { Construct } from "constructs";
import { SecretsManagerClient, CreateSecretCommand } from '@aws-sdk/client-secrets-manager';
import {
  EC2Client,
  CreateVpcCommand,
  ModifyVpcAttributeCommand,
  CreateTagsCommand,
} from '@aws-sdk/client-ec2';
import { S3Client, CreateBucketCommand } from '@aws-sdk/client-s3';
import { SSMClient, PutParameterCommand } from '@aws-sdk/client-ssm';


interface PrerequisiteConfigProps {
  project: string;
}

export class PrelocalStack extends Stack {
  constructor(
    scope: Construct,
    id: string,
    props: StackProps & PrerequisiteConfigProps
  ) {
    super(scope, id, props);

    const {
      project,
    } = props;

    console.log(`some: ${project}`)
    const ssmClient = new SSMClient({ region: 'us-east-1' });
    const paramCommand1 = new PutParameterCommand({
      Name: "/cdk-bootstrap/somethins/version",
      Value: "6.0.0",
      Type: 'String',
    });
    const paramCommand2 = new PutParameterCommand({
      Name: "bootstrapUsersPasswordArn",
      Value: "password",
      Type: 'String',
    });
    (async () => {
      await ssmClient.send(paramCommand1);
      await ssmClient.send(paramCommand2);
      try{
      } catch {
        console.log('SSM RESPONSE ERROR')
      }
    })()

    const smClient = new SecretsManagerClient({ region: 'us-east-1' });
    const config = {
      bootstrapUsersPasswordArn: "arn:aws:ssm:us-east-1:000000000000:parameter/bootstrapUsersPasswordArn",
      oktaMetadataUrl: "oktaMetadataUrl",
      brokerString: "PUT A REAL ONE IN",
      iamPermissionsBoundaryArn: "arn:aws:iam::000000000000:policy/cms-cloud-admin/developer-boundary-policy",
      iamPath: "/delegatedadmin/developer/",
      vpcName: "vpcName",
      project: "seds"
    }
    const secretCommand = new CreateSecretCommand({
      Name: 'seds-default',
      SecretString: JSON.stringify(config),
    });
    (async () => {
      try{
        await smClient.send(secretCommand);
      } catch {
        console.log('SECRET RESPONSE ERROR')
      }
    })()

    const ec2Client = new EC2Client({ region: 'us-east-1' });
    const vpcCommand = new CreateVpcCommand({
      CidrBlock: '10.0.0.0/16',
    });
    (async () => {
      try{
        const vpcResponse = await ec2Client.send(vpcCommand);
        const vpcId = vpcResponse.Vpc!.VpcId!;
        await ec2Client.send(new ModifyVpcAttributeCommand({ VpcId: vpcId, EnableDnsSupport: { Value: true } }));
        await ec2Client.send(new ModifyVpcAttributeCommand({ VpcId: vpcId, EnableDnsHostnames: { Value: true } }));
        await ec2Client.send(
          new CreateTagsCommand({
            Resources: [vpcId],
            Tags: [{ Key: 'Name', Value: 'vpcName' }],
          })
        );

      } catch {
        console.log('VPC RESPONSE ERROR')
      }
    })()

    const s3Client = new S3Client({ region: 'us-east-1' });
    const bucketCommand = new CreateBucketCommand({ Bucket: "cdk-somethins-assets-000000000000-us-east-1" });
    (async () => {
      try{
        await s3Client.send(bucketCommand);
      } catch {
        console.log('s3 bucket RESPONSE ERROR')
      }
    })()
  }
}

async function main() {
  const app = new App({
    defaultStackSynthesizer: new DefaultStackSynthesizer(
      {
        "deployRoleArn": "somethin",
        "fileAssetPublishingRoleArn": "somethin",
        "imageAssetPublishingRoleArn": "somethin",
        "cloudFormationExecutionRole": "somethin",
        "lookupRoleArn": "somethin",
        "qualifier": "somethins"
      }
    ),
  });

  const project = process.env.PROJECT!;

  new PrelocalStack(app, "seds-prelocal", {
    project,
    env: {
      account: process.env.CDK_DEFAULT_ACCOUNT,
      region: process.env.CDK_DEFAULT_REGION,
    },
  });
  console.log(project)
}

main();
console.log('boom')
