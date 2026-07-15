# CMDCT-6054 AWS Emulator Evaluation

Date: 2026-07-15

This is the consolidated decision record for replacing LocalStack in SEDS local development.

The goal was to keep the existing `./run local` development model as much as possible: CDK bootstrap, CDK deploy, CloudFormation, Lambda, API Gateway, DynamoDB, Cognito-related local auth behavior, S3 bootstrap assets, Secrets Manager, and local UI startup.

The implementation branches should not modify files under `services/`. Local auth and API routing should be handled from the local CLI/proxy/deployment layer instead of changing the app or UI source.

## Bottom Line

MiniStack is the current leading candidate.

Floci and LocalEmu are also viable enough to keep as working POC branches, but they are not equal recommendations:

1. `cmdct-6054ministack` is the preferred path.
2. `cmdct-6054floci` is a credible second path.
3. `cmdct-6054localemu` works now, but is the least preferred of the three active candidates.

None of the tools evaluated was a zero-change LocalStack replacement. Every viable option needed repo-specific local-development changes. The current active branches have been pushed toward an apples-to-apples shape: shared same-origin local API/Cognito frontend proxying, shared seed-data test coverage, shared reset coverage, and no `services/` diffs against `origin/main`.

## Current Active Candidates

| Branch                | Current status                        | Why keep it                                                                                                                                                                        | Main concern                                                                                                                                                                            |
| --------------------- | ------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `cmdct-6054ministack` | Preferred working candidate           | Produces the cleanest current local-dev shape, preserves the CDK-based architecture, avoids the LocalStack account and dashboard path, and had the strongest clean bakeoff result. | Still requires emulator-specific CDK/runtime adjustments and a more involved `./run local` wrapper to manage the MiniStack Docker container.                                            |
| `cmdct-6054floci`     | Working backup candidate              | Also preserves the CDK-shaped architecture and was one of the strongest original candidates. It remains a real option if MiniStack becomes blocked.                                | Needs Floci-specific host, container, ECR-port, secret-bootstrap, and seed-trigger handling.                                                                                            |
| `cmdct-6054localemu`  | Working but least preferred candidate | It reached the same broad class as the other active branches: a local AWS-emulator-backed SEDS workflow instead of a reduced hybrid setup.                                         | Most bespoke branch: Python/pipx host install, direct local Cognito provisioning, manual API Gateway stage repair, synchronous seed invoke, and apparent maintainer-concentration risk. |

The practical recommendation is to move forward with MiniStack unless a new blocker appears. Floci should remain the fallback. LocalEmu should be kept as history and as a proof that the tool was considered seriously, but it should not be the default recommendation.

## Current Branch Parity

Found directly in the reviewed implementation branches:

- `cmdct-6054ministack`, `cmdct-6054floci`, and `cmdct-6054localemu` all modify the same core local-development surface: `run`, `cli/commands/local.ts`, `cli/commands/reset.ts`, `cli/lib/seedData.ts`, `cli/lib/utils.ts`, `cli/lib/localFrontendProxy.ts`, local docs, deployment config/util/prerequisite files, the API/auth/UI deployment stacks, package metadata, and tests for local/reset/seed/utils behavior.
- All three branches keep `services/` unchanged against `origin/main`.
- All three branches use the same `cli/lib/localFrontendProxy.ts` pattern so the frontend can keep its normal Cognito/API code while local requests are routed through same-origin proxy paths.
- All three branches include seed-data test coverage and reset test coverage.
- The remaining branch-only files are intentional implementation differences, not stale service wiring.

Remaining branch-only files:

| File                                           | Branch                   | Why it exists                                                                                                                                                                                                                | Ranking impact                                                                                                                             |
| ---------------------------------------------- | ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `cli/commands/run-wrapper.test.ts`             | MiniStack only           | MiniStack's `run` wrapper owns Docker container create/reuse/start and port reconciliation before the CLI starts.                                                                                                            | Slight complexity cost, but it is contained and tested.                                                                                    |
| `deployment/constructs/lambda-dynamo-event.ts` | MiniStack only           | MiniStack needs Dynamo event Lambda bundling adjusted so AWS SDK modules are bundled and retry attempts are not passed in the unsupported local path.                                                                        | Real emulator-specific CDK complexity; not enough by itself to drop MiniStack below Floci.                                                 |
| `cli/lib/localCognito.ts`                      | LocalEmu only            | LocalEmu does not get the same Cognito resources cleanly through the CDK path, so the branch creates/updates the local user pool and client directly through Cognito API calls.                                              | Meaningful complexity cost; this is one reason LocalEmu ranks below MiniStack and Floci.                                                   |
| `deployment/stacks/data.ts`                    | Floci and MiniStack only | Floci disables the deploy-time trigger and seeds explicitly after deploy; MiniStack keeps the trigger but adds table dependencies. LocalEmu leaves the stack trigger as-is and invokes seed data synchronously after deploy. | Floci and MiniStack both need seed-ordering adjustments. LocalEmu avoids this file but pays for it in bespoke CLI seeding/API stage logic. |

Inferred from the reviewed files:

- MiniStack remains the leader because its extra complexity is mostly wrapper/CDK-local compatibility and is covered by tests.
- Floci remains second because its production-code changes are reasonably contained, but it still needs more Floci-specific container and seed-trigger handling than MiniStack's preferred path.
- LocalEmu remains third because it requires the most bespoke application-adjacent local orchestration: direct Cognito provisioning, direct user fixture writes through Cognito APIs, API Gateway stage repair, Python/pipx setup, and a more fragile host install story.

## Evaluation History

The original evaluation narrowed the field to Floci and MiniStack. Later work added LocalEmu as another active implementation branch. At different points in the evaluation, status docs disagreed because the branches were moving:

- Older summaries favored Floci from the first six-tool comparison.
- A later local bakeoff favored MiniStack because it completed cleanly while Floci completed with seed-data errors and LocalEmu failed during bootstrap.
- Subsequent branch work brought LocalEmu into the working-candidate group, but it remains the least attractive option operationally.

This document supersedes the older split status, bakeoff, executive-summary, and MicroCloud notes.

## LocalEmu External Risk

LocalEmu deserves to remain in the history because it works as an active implementation branch, but it carries additional tool risk:

- LocalEmu's own public docs describe a pure-Python core and pip install path. That matches the branch's host setup cost: developers need Python packaging/pipx plus a long runtime dependency install command, not just a container image.
- The public launch story and repository metadata are centered on Tarek Cheikh/TarekCheikh. Treat that as maintainer-concentration risk unless broader maintainer activity becomes visible.
- This does not mean the LocalEmu branch was implemented poorly. It means the tool asks this repo to carry more bespoke local-emulator glue, and the upstream project appears younger and more concentrated than the alternatives.

References:

- LocalEmu site: https://localemu.cloud/
- LocalEmu GitHub README: https://github.com/localemu/localemu
- LocalEmu launch story: https://aws.plainenglish.io/meet-localemu-the-free-successor-to-localstack-b9755ba6c91e

## Other Tools Considered

| Tool or branch         | Final status     | Reason                                                                                                                                                                                                                                      |
| ---------------------- | ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `cmdct-6054cloudmock`  | Partial fit only | CloudMock could support a reduced hybrid shape with local backing services plus local app/API processes, but the full CDK deploy path did not get to the same level as MiniStack, Floci, or LocalEmu.                                       |
| `cmdct-6054fakecloud`  | Partial fit only | FakeCloud was usable for narrower DynamoDB-backed local state, but not for the full EC2, CloudFormation, Lambda, API Gateway, and CDK path this repo needs.                                                                                 |
| `cmdct-6054microcloud` | Rejected         | MicroCloud is a private cloud platform built around LXD, MicroCeph, and MicroOVN. It is not an AWS emulator and does not provide the CloudFormation, Lambda, API Gateway, DynamoDB, IAM, Secrets Manager, or CDK compatibility needed here. |
| `cmdct-6054localcloud` | Rejected         | The evaluated LocalCloud options were either the wrong product category or not obtainable as a usable AWS-emulator implementation for SEDS. No path reached the required Lambda, API Gateway, CloudFormation, and CDK coverage.             |

CloudMock and FakeCloud are useful historical records because they showed where a lighter hybrid local architecture might go. They did not reach the same point as MiniStack, Floci, and LocalEmu because they did not preserve the current full CDK-shaped local stack.

MicroCloud and LocalCloud should remain documented rejections, not active fallbacks.

## Repo Requirements That Drove The Decision

The viable replacement has to support enough of the existing local path to avoid redesigning SEDS local development around a different architecture:

- `cdklocal` or equivalent CDK bootstrap and deploy flow
- CloudFormation stack create, update, output, and readback behavior
- Lambda deployment and invocation
- API Gateway routing compatible with the UI and local API calls
- DynamoDB tables and streams
- Cognito-compatible local auth behavior for the UI path
- S3-compatible CDK asset publishing
- Secrets Manager behavior for local default secrets
- EC2/VPC/subnet/security-group constructs well enough for local stack synthesis and deploy
- Local UI startup with environment values derived from stack outputs

MiniStack, Floci, and LocalEmu are the only evaluated branches that reached a working local-emulator implementation against that class of requirements.

## Decision

Use MiniStack as the recommended CMDCT-6054 replacement path.

Keep Floci as the backup implementation and LocalEmu as the least-preferred working implementation. Keep the partial and rejected tools in this document so the evaluation history is not lost, but do not keep separate stale decision docs for them.
