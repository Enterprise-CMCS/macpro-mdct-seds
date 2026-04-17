#!/usr/bin/env node
import { Octokit } from "@octokit/rest";
import { createActionAuth } from "@octokit/auth-action";
import {
  CloudFormationClient,
  ListStacksCommand,
  // DeleteStackCommand,
} from "@aws-sdk/client-cloudformation";
import { setBranchName } from "./setBranchName.ts";

const [owner, repo] = process.env.GITHUB_REPO!.split("/");
const appName = process.env.APP_NAME_LOWER!;

async function run() {
  const authentication = await createActionAuth()();
  const octokit = new Octokit({ auth: authentication.token });
  const cfn = new CloudFormationClient({});

  // gets all branches from github in stack name format
  const { data } = await octokit.repos.listBranches({
    owner,
    repo,
  });
  console.log("branches");
  console.log(data);
  const legitStacks = data.map(
    (branch) => `${appName}-${setBranchName(branch.name)}`
  );

  console.log("legitStacks");
  console.log(legitStacks);
  // gets from aws all stacks that start with [appName]-
  const allAppStacks: string[] = [];

  // then see if there are dups
  const response = await cfn.send(
    new ListStacksCommand({
      StackStatusFilter: ["CREATE_COMPLETE", "UPDATE_COMPLETE"],
    })
  );
  const appStacks = response
    .StackSummaries!.map((stack) => stack.StackName)
    .filter(
      (stackName) =>
        stackName!.startsWith(`${appName}-`) &&
        stackName !== `${appName}-prerequisites`
    ) as string[];
  allAppStacks.push(...appStacks);

  console.log("allAppStacks");
  console.log(allAppStacks);

  // stacks that are in aws but without corresponding branches in github are deletable
  // const deletableStacks = ["seds-xee94a73578"];
  const deletableStacks = allAppStacks.filter(
    (item) => !legitStacks.includes(item)
  );

  console.log("deletableStacks");
  console.log(deletableStacks);
  for (const stack of deletableStacks) {
    // await cfn.send(
    //   new DeleteStackCommand({
    //     StackName: stack,
    //   })
    // );
    console.log(`Issued delete command for ${stack}`);

    // // Find if stackName starts with any active branch prefix
    // // Sometimes CDK might append random things, so we check if the stack belongs to a protected branch directly
    // // or if the stack matches an active branch.
    // const shouldKeep = Array.from(listA).some((activePrefix) =>
    //   stackName.startsWith(activePrefix)
    // );
    // if (!shouldKeep) {
    //   console.log(
    //     `Deleting stack (not matched to active branch): ${stackName}`
    //   );
    //   let retainResources: string[] | undefined;
    //   if (stack.StackStatus === "DELETE_FAILED") {
    //     try {
    //       const eventsResp = await cfn.send(
    //         new DescribeStackEventsCommand({ StackName: stackName })
    //       );
    //       if (eventsResp.StackEvents) {
    //         // Find resources that failed to delete
    //         const failedResources = eventsResp.StackEvents.filter(
    //           (event) =>
    //             event.ResourceStatus === "DELETE_FAILED" &&
    //             event.ResourceType !== "AWS::CloudFormation::Stack" &&
    //             event.LogicalResourceId
    //         ).map((event) => event.LogicalResourceId!);
    //         // Use Set to remove duplicates
    //         if (failedResources.length > 0) {
    //           retainResources = Array.from(new Set(failedResources));
    //           console.log(
    //             `Found DELETE_FAILED resources to retain for ${stackName}: ${retainResources.join(
    //               ", "
    //             )}`
    //           );
    //         }
    //       }
    //     } catch (err) {
    //       console.error(`Error fetching stack events for ${stackName}:`, err);
    //     }
    //   }
  }
}

run();
