# AWS Emulator Executive Summary

Date: 2026-05-19

This document is the executive summary for the six `CMDCT-6054` LocalStack-replacement evaluations:

- CloudMock
- FakeCloud
- Floci
- MiniStack
- MicroCloud
- LocalCloud

It is the short decision memo. The companion comparison matrix is in `docs/aws-emulator-evaluation-summary.md`.

Some branch-specific notes were captured during the evaluation, but some of those local POC branches were later deleted after the field was narrowed. Treat this memo and the comparison matrix as the durable record.

## Executive Conclusion

No product tested was a true zero-change LocalStack replacement for SEDS.

Two options were viable for preserving the current SEDS local-development architecture:

1. Floci
2. MiniStack

Of those two, Floci is the strongest overall recommendation. MiniStack is a credible second option.

CloudMock and FakeCloud only worked in reduced hybrid local-dev shapes, where parts of the application ran directly as local processes instead of staying inside a fully emulated AWS-style stack.

MicroCloud and LocalCloud should be treated as rejected.

## Decision

If the goal is to keep the existing `./run local` model based on CDK bootstrap, CDK deploy, CloudFormation, Lambda, API Gateway, DynamoDB, and EC2/VPC primitives, the decision should be:

1. Prefer Floci
2. Keep MiniStack as the backup choice
3. Do not pursue CloudMock, FakeCloud, MicroCloud, or LocalCloud for that goal

## Why Floci Won

Floci was the closest thing to a practical LocalStack replacement for this repo.

It preserved the current CDK-shaped local architecture and was validated end to end through:

- bootstrap
- prerequisite deploys
- full stack deploy
- watch mode
- seed-data execution
- UI startup
- live API behavior

Its weaknesses were real, but operational rather than existential:

- it needed repo-specific fixes
- it needed `LOCALSTACK_HOST=host.docker.internal`
- it needed the container to run as `root`
- it was more reliable with non-persistent state

Those are manageable caveats. They are not architectural disqualifiers.

## Why MiniStack Is Second

MiniStack also preserved the full local CDK deploy model and ultimately worked end to end.

Its tradeoff profile was slightly worse for this repo:

- more CloudFormation gaps had to be worked around
- more repo-specific deployment changes were required
- the cleanest operating model was to start a fresh MiniStack container for each session
- the branch still depends on the `localstack` stage name and LocalStack-style raw API Gateway proxy conventions

That still makes MiniStack viable. It just looked less transparent than Floci.

## Why The Others Lost

CloudMock and FakeCloud were not full replacements.

CloudMock could support local AWS-shaped backing services, but it broke down on the full CDK deploy path and ended in a hybrid model with a locally hosted app API.

FakeCloud was even narrower. It was usable for DynamoDB-backed local state, but it could not support the EC2 and CloudFormation behavior SEDS needs for the full stack.

MicroCloud was the wrong category of product. It is a private cloud platform, not an AWS emulator.

LocalCloud was also a dead end. The official `localcloud.sh` product is an AI local-dev platform, not an AWS emulator, and the separate emulator-flavored LocalCloud project was not obtainable from its advertised repository during evaluation.

## Better Than LocalStack

Across the six evaluations, the meaningful advantages over LocalStack were:

- Floci and MiniStack avoided the LocalStack CLI/account/dashboard path while still preserving the CDK-shaped local architecture.
- CloudMock and FakeCloud were lighter-weight in their reduced hybrid modes.
- Several products had simpler startup or lower operational overhead than the current LocalStack path.

None of those advantages mattered enough to overcome architectural incompatibility in the rejected options.

## Worse Than LocalStack

Across the six evaluations, the recurring weaknesses were:

- weaker CloudFormation depth
- weaker Lambda/API Gateway fidelity
- more repo-specific adaptation than “drop-in replacement” marketing would suggest
- less reliable dirty-state redeploy behavior

That is why only Floci and MiniStack remained viable by the end.

## Recommendation

The practical recommendation for SEDS is:

1. Standardize on Floci if the team wants a LocalStack replacement now.
2. Keep MiniStack documented as the backup option.
3. Preserve the CloudMock and FakeCloud notes as useful records of partial-fit experiments.
4. Treat MicroCloud and LocalCloud as documented rejections.

If the team wants the least risky path, it should choose the best emulator that preserves the current architecture rather than redesigning local development around a hybrid model. Based on this evaluation set, that means Floci.
