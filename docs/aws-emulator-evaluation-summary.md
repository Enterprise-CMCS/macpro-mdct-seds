# CMDCT-6054 AWS Emulator Evaluation

Date: 2026-07-15

This is the consolidated decision record for replacing LocalStack in SEDS local development.

The goal was to keep the existing `./run local` development model as much as possible: CDK bootstrap, CDK deploy, CloudFormation, Lambda, API Gateway, DynamoDB, Cognito-related local auth behavior, S3 bootstrap assets, Secrets Manager, and local UI startup.

## Bottom Line

MiniStack is the current leading candidate.

Floci and LocalEmu are also viable enough to keep as working POC branches, but they are not equal recommendations:

1. `cmdct-6054ministack` is the preferred path.
2. `cmdct-6054floci` is a credible second path.
3. `cmdct-6054localemu` works now, but is the least preferred of the three active candidates.

None of the tools evaluated was a zero-change LocalStack replacement. Every viable option needed repo-specific local-development changes.

## Current Active Candidates

| Branch                | Current status                        | Why keep it                                                                                                                                                                        | Main concern                                                                                                                                                                 |
| --------------------- | ------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `cmdct-6054ministack` | Preferred working candidate           | Produces the cleanest current local-dev shape, preserves the CDK-based architecture, avoids the LocalStack account and dashboard path, and had the strongest clean bakeoff result. | Still requires emulator-specific CDK/runtime adjustments and container setup.                                                                                                |
| `cmdct-6054floci`     | Working backup candidate              | Also preserves the CDK-shaped architecture and was one of the strongest original candidates. It remains a real option if MiniStack becomes blocked.                                | Earlier runs showed post-deploy seed-data noise, and the branch needs Floci-specific host, container, and auth wiring.                                                       |
| `cmdct-6054localemu`  | Working but least preferred candidate | It reached the same broad class as the other active branches: a local AWS-emulator-backed SEDS workflow instead of a reduced hybrid setup.                                         | It has the most fragile host setup and the most bespoke local auth/frontend proxy behavior. Earlier bakeoff work also exposed a bootstrap failure before later branch fixes. |

The practical recommendation is to move forward with MiniStack unless a new blocker appears. Floci should remain the fallback. LocalEmu should be kept as history and as a proof that the tool was considered seriously, but it should not be the default recommendation.

## Evaluation History

The original evaluation narrowed the field to Floci and MiniStack. Later work added LocalEmu as another active implementation branch. At different points in the evaluation, status docs disagreed because the branches were moving:

- Older summaries favored Floci from the first six-tool comparison.
- A later local bakeoff favored MiniStack because it completed cleanly while Floci completed with seed-data errors and LocalEmu failed during bootstrap.
- Subsequent branch work brought LocalEmu into the working-candidate group, but it remains the least attractive option operationally.

This document supersedes the older split status, bakeoff, executive-summary, and MicroCloud notes.

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
