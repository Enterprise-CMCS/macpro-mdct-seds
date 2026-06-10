# Floci Local Dev Notes

Date: 2026-05-19

This document captures the `CMDCT-6054` evaluation of Floci for SEDS local development.

## Summary

Floci was the first alternative tested for this ticket that could plausibly preserve the existing CDK-based local architecture for this repo.

On this branch, the local path was rewired to use Floci throughout. After repo-specific fixes, Floci could:

- pass native Floci health checks
- answer STS, EC2, and CloudFormation calls
- complete `cdklocal bootstrap`
- deploy the local prerequisite stack
- deploy the main prerequisite stack
- deploy the full `stage=floci` stack

That is materially better than the CloudMock and FakeCloud experiments for this repo.

I later validated the full `./run local` path in this worktree on the canonical host port `4566`, including:

- `cdklocal bootstrap`
- both prerequisite deploys
- full `stage=floci` deploy
- `cdklocal watch`
- seed-data execution
- the local UI on `http://localhost:3000`
- an unauthenticated API probe returning `401`

The final branch path is now materially stronger than the initial Floci experiment.

## What Changed In This Branch

- `./run local` now starts Floci in Docker.
- CDK local deploys now use `stage=floci`.
- Local prerequisite provisioning was reduced to the pieces Floci can model reliably.
- VPC lookup was replaced with explicit imported attributes for the local Floci path.
- The default local secret is upserted directly instead of being recreated by CloudFormation.
- Lambda asset bundling removes `node_modules/nwsapi/dist/lint.log` to avoid a Floci ZIP extraction failure.
- The Floci container now advertises itself to Lambda sidecars with `FLOCI_HOSTNAME=host.docker.internal`.
- The Floci local runner no longer forces persisted emulator state into the repo.

## What Worked

- `GET /_floci/init` returned healthy status from Floci.
- `aws sts get-caller-identity` worked against Floci.
- `aws ec2 describe-vpcs` worked against Floci.
- CloudFormation create and describe calls worked.
- `yarn cdklocal bootstrap` worked on clean Floci containers.
- `yarn cdklocal deploy --app ./deployment/local/prerequisites.ts` worked.
- `yarn cdklocal deploy --app ./deployment/prerequisites.ts` worked.
- `yarn cdklocal deploy --context stage=floci --all --no-rollback` worked on clean Floci containers after the repo-specific fixes.
- Direct Lambda invocation succeeded after running the Floci container as `root`.
- A full `./run local` run completed successfully on host port `4566`.
- The generated UI env pointed at Floci's raw API Gateway route.
- The local UI served on `http://localhost:3000`.
- A browser screenshot was captured successfully from the running UI.
- An unauthenticated `/users` request returned `401` after the auth handling fix.

## Pain Points And Limitations

- Floci is not a zero-change drop-in replacement for this repo.
- The local prerequisite stack could not rely on fake EC2 resources created through CloudFormation. Floci accepted those resources, but the resulting physical IDs were not usable as real VPC/subnet infrastructure for the rest of the stack.
- `ec2.Vpc.fromLookup(...)` was not viable in the Floci local path. It triggered unsupported or incomplete lookup behavior, including `DescribeVpnGateways`.
- The old secret-creation pattern was too brittle for emulator reuse. Recreating `seds-default` through CloudFormation caused collisions, so the branch now upserts it directly with the AWS CLI.
- Floci rejected some Lambda ZIP assets with `Failed to extract deployment package: only DEFLATED entries can have EXT descriptor`. The concrete offender in this repo was `node_modules/nwsapi/dist/lint.log`.
- Lambda startup failed in a non-root Floci container with `Failed to start Lambda container: java.net.BindException: Permission denied`. Running the Floci container as `root` avoided that failure in validation.
- Lambda sidecars should not be pointed at `localhost`. For this branch, `FLOCI_HOSTNAME=host.docker.internal` is the correct shape for Docker-based Lambda execution when Floci is bound to host port `4566`.
- Persisted Floci state made reruns unreliable in this repo. Reusing a persistent emulator state produced noisy IAM policy collisions during redeploy, so the branch now runs Floci without a bind-mounted persistent data directory by default.
- Floci still emitted repeated DynamoDB Streams poller warnings for streams such as `floci-auth-user` and `floci-form-templates`. The stack deployed anyway, but the logs are noisy.

## Advantages

Observed advantages were modest, but real:

- Floci stayed close enough to the previous emulator's surface area that the SEDS CDK local model could be preserved instead of replaced outright.
- For this repo, Floci was much closer to a viable fit than CloudMock or FakeCloud.
- The branch only needed Docker, Colima, AWS CLI, and the existing `cdklocal` workflow. No separate vendor CLI install was required.

## Tradeoffs

- More repo-specific adaptation was required than the compatibility marketing would imply.
- The Lambda networking model is touchy. Using the wrong advertised host breaks runtime calls even when CloudFormation deployment succeeds.
- Running the Floci container as non-root was not good enough for Lambda startup in this environment.
- The EC2/VPC path is not strong enough to trust CDK lookups or fake infrastructure resources blindly.
- The stream poller warnings are noisier than the original branch path we started from.

## Recommendation

Floci is the closest thing to a viable fit found during `CMDCT-6054`.

If the goal is to keep the current CDK-shaped local architecture, Floci is plausible with the branch changes in this worktree. I would treat it as "promising but not fully de-risked" rather than "drop-in proven."

The main remaining caution is emulator quality, not branch wiring. This setup still depends on:

- running the Floci container as `root`
- using `FLOCI_HOSTNAME=host.docker.internal`
- avoiding persisted Floci state for the default local path

Given those constraints, Floci is now the best option tested for SEDS in `CMDCT-6054`.

## Sources

- Floci docs: https://floci.io/floci/
- Floci getting started: https://floci.io/floci/getting-started/
