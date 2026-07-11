# MiniStack Local Dev Notes

Date: 2026-05-19

This document captures the `CMDCT-6054` evaluation of MiniStack for SEDS local development.

## Summary

MiniStack is viable for this repo's existing CDK-based local architecture, but not as a zero-change drop-in replacement.

On this branch, `./run local` now uses MiniStack throughout. After repo-specific fixes, the full local path worked end to end:

- MiniStack health, STS, EC2, and CloudFormation calls worked.
- `cdklocal bootstrap` worked.
- The local prerequisite stack deployed.
- The main prerequisite stack deployed.
- The full `seds-ministack` app stack deployed.
- `cdklocal watch` stayed running after deploy.
- The UI served successfully.
- An unauthenticated `/users` request returned `401`.
- A headless browser screenshot was captured from the running UI.

Validation artifacts for the successful run are in:

- `.validation/run-local-20260519T164900/run-local.log`
- `.validation/run-local-20260519T164900/ui-home.png`

## What Changed In This Branch

- `./run local` now starts a fresh MiniStack Docker container instead of relying on a separate emulator CLI.
- The local runner now supports `MINISTACK_PORT` and `LOCAL_UI_PORT`.
- The generated UI env now points at MiniStack's raw API Gateway proxy route instead of just replacing `https` with `http`.
- The local runner starts Vite headlessly with an explicit host and port.
- `./run reset` now removes the MiniStack container directly.
- The local prerequisite secret now includes `vpcId` so the local stack can import the fake VPC explicitly.
- The local stack uses imported VPC attributes for the MiniStack path instead of `Vpc.fromLookup(...)`.
- Real-AWS-only resources were skipped in the MiniStack local path where MiniStack CloudFormation support was not good enough.
- Lambda event invoke config resources were skipped in the MiniStack local path.
- Lambda bundling was adjusted so the deployed functions include the DynamoDB SDK modules they actually need at runtime.
- The app-api auth path now returns `401` for missing or malformed `x-api-key` values instead of throwing a `500`.

## What Worked

- `GET /health` returned ready status from MiniStack.
- `aws sts get-caller-identity` worked against MiniStack.
- `aws ec2 describe-vpcs` worked against MiniStack.
- CloudFormation create, describe, and CDK bootstrap behavior worked well enough for this repo.
- `yarn cdklocal bootstrap` worked on a clean MiniStack container.
- `yarn cdklocal deploy --app ./deployment/local/prerequisites.ts` worked.
- `yarn cdklocal deploy --app ./deployment/prerequisites.ts --context stage=ministack` worked.
- `yarn cdklocal deploy --all --context stage=ministack --no-rollback` worked on a clean MiniStack container.
- The seed-data trigger completed successfully during the full deploy.
- `./run local` completed the deploy path and started both `cdklocal watch` and the Vite UI server.
- The UI served `200` on `http://127.0.0.1:3002/` in validation.
- The generated UI env pointed at `http://localhost:4570/restapis/668eba20/ministack/_user_request_`.
- The live `/users` probe returned `401` after the auth fix redeployed through `cdklocal watch`.

## Pain Points And Limitations

- MiniStack is not a zero-change drop-in for SEDS.
- Several CloudFormation resource types used by this repo were not usable in the MiniStack local path:
  - `AWS::IAM::OIDCProvider`
  - `AWS::Logs::ResourcePolicy`
  - `AWS::ApiGateway::GatewayResponse`
  - `AWS::Lambda::EventInvokeConfig`
- `ec2.Vpc.fromLookup(...)` was not viable for the MiniStack local path. The fake VPC exists, but the lookup assumptions CDK makes were not reliable enough for this repo.
- The old local secret shape was missing `vpcId`, which the imported-VPC path needs.
- The seed-data Lambda initially failed because it loaded JSON by raw relative path instead of from the deployed bundle directory.
- The seed-data trigger initially produced a noisy `Header overflow` failure path until the seed code stopped using the chatty shared Dynamo client.
- Some deployed Lambdas initially failed at runtime because the MiniStack bundle path did not include `@aws-sdk/client-dynamodb` and `@aws-sdk/lib-dynamodb`.
- Reusing a dirty MiniStack container made updates unreliable. In validation, the cleanest path was to start a fresh MiniStack container for each `./run local` session.
- Internally, the repo now uses the `ministack` stage name for the MiniStack path. That keeps stack names and API Gateway proxy URLs consistent with the branch.

## Advantages

- No separate vendor CLI install is required for the local path.
- No vendor account, dashboard, or login flow is involved.
- The existing CDK-shaped local architecture could be preserved instead of being replaced with a hybrid local-server model.
- Once the repo-specific fixes were in place, the create-from-scratch deploy path was reliable on clean MiniStack containers.

## Tradeoffs

- More repo-specific adaptation was required than a drop-in replacement would imply.
- CloudFormation coverage gaps forced conditional logic in the local CDK path.
- Dirty-state redeploy behavior was weaker than desired. Starting from a fresh MiniStack container each run was the most reliable approach.
- The MiniStack path still depends on MiniStack-specific stage naming and raw API Gateway proxy conventions.

## Recommendation

MiniStack is a workable option for SEDS if the goal is to keep the current CDK-based local architecture.

I would treat it as viable, but not transparent. The branch is in a good state for local development now, but the operating model should be:

- start a fresh MiniStack container for each local session
- expect the local stage name to remain `ministack`
- prefer the branch's `./run local` flow over ad hoc partial emulator reuse

Compared with CloudMock and FakeCloud, MiniStack is materially stronger for this repo because it preserves the full local CDK deploy model instead of forcing a reduced hybrid runtime.

## Sources

- MiniStack validation performed in this repo on May 19, 2026:
  - `./run local` with `MINISTACK_PORT=4570` and `LOCAL_UI_PORT=3002`
  - `corepack yarn tsc -p cli/tsconfig.json`
  - `corepack yarn tsc -p services/app-api/tsconfig.json`
  - `corepack yarn workspace app-api test --run libs/authorization.test.ts libs/handler-lib.test.ts`
  - live API probe against `http://127.0.0.1:4570/restapis/668eba20/ministack/_user_request_/users`
  - Playwright screenshot capture from `http://127.0.0.1:3002/`
- Successful validation artifacts:
  - `.validation/run-local-20260519T164900/run-local.log`
  - `.validation/run-local-20260519T164900/ui-home.png`
