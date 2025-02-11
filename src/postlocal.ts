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
import { writeUiEnvFile } from "./write-ui-env-file.js";


interface PrerequisiteConfigProps {
  project: string;
  stage: string;
}

export class PostlocalStack extends Stack {
  constructor(
    scope: Construct,
    id: string,
    props: StackProps & PrerequisiteConfigProps
  ) {
    super(scope, id, props);

    const {
      project,
      stage
    } = props;

    console.log(project);
    console.log(stage);

    (async () => {
      await writeUiEnvFile(stage, true);
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
  const stage = app.node.getContext("stage");

  new PostlocalStack(app, "seds-postlocal", {
    project,
    stage,
    env: {
      account: process.env.CDK_DEFAULT_ACCOUNT,
      region: process.env.CDK_DEFAULT_REGION,
    },
  });
}

main();
