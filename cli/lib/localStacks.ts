// This file is managed by macpro-mdct-core so if you'd like to change it let's do it there
import {
  CloudFormationClient,
  DeleteStackCommand,
  DescribeStacksCommand,
  waitUntilStackDeleteComplete,
} from "@aws-sdk/client-cloudformation";
import { project, region } from "./consts.ts";
import { restartMiniStackContainer, waitForMiniStack } from "./ministack.ts";

const TERMINAL_FAILURE_STATES = new Set([
  "CREATE_FAILED",
  "UPDATE_FAILED",
  "ROLLBACK_FAILED",
  "UPDATE_ROLLBACK_FAILED",
]);

export type RecoverFailedLocalStacksOptions = {
  endpoint: string;
  port: string;
  containerName: string;
};

const localCloudFormationClient = (endpoint: string) =>
  new CloudFormationClient({
    region,
    endpoint,
    credentials: {
      accessKeyId: "test",
      secretAccessKey: "test", // pragma: allowlist secret
    },
  });

const stackDoesNotExist = (error: unknown) =>
  error instanceof Error &&
  (error.name === "ValidationError" ||
    error.message.includes("does not exist"));

export const recoverFailedLocalStacks = async ({
  endpoint,
  port,
  containerName,
}: RecoverFailedLocalStacksOptions) => {
  const stackProject = project;
  const stackNames = [
    `${stackProject}-ministack`,
    `${stackProject}-prerequisites`,
    `${stackProject}-local-prerequisites`,
  ];

  const client = localCloudFormationClient(endpoint);
  let needsMiniStackRestart = false;

  for (const stackName of stackNames) {
    let status: string | undefined;

    try {
      const result = await client.send(
        new DescribeStacksCommand({ StackName: stackName })
      );
      status = result.Stacks?.[0]?.StackStatus;
    } catch (error) {
      if (stackDoesNotExist(error)) {
        continue;
      }
      throw error;
    }

    if (status === "DELETE_COMPLETE") {
      // MiniStack keeps DELETE_COMPLETE stacks visible; CDK then tries to update them.
      needsMiniStackRestart = true;
      continue;
    }

    if (!status || !TERMINAL_FAILURE_STATES.has(status)) {
      continue;
    }

    console.log(
      `Local stack ${stackName} is ${status}; deleting before redeploy...`
    );

    await client.send(new DeleteStackCommand({ StackName: stackName }));

    const result = await waitUntilStackDeleteComplete(
      { client, maxWaitTime: 600 },
      { StackName: stackName }
    );

    if (result.state !== "SUCCESS") {
      throw new Error(
        `Timed out waiting for ${stackName} to delete after ${status}.`
      );
    }

    console.log(`Deleted ${stackName}.`);
    needsMiniStackRestart = true;
  }

  if (needsMiniStackRestart) {
    restartMiniStackContainer(containerName);
    await waitForMiniStack(port);
  }
};
