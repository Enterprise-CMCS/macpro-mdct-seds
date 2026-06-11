# AWS Emulator Evaluation Summary

Date: 2026-05-19

This document collects the `CMDCT-6054` LocalStack-replacement evaluations across the POC worktrees for SEDS local development.

Some branch-specific notes were written during the evaluation, but some of those local POC branches were later deleted after narrowing the field. Treat this document and `docs/aws-emulator-executive-summary.md` as the durable record.

## Bottom Line

- Floci is the strongest LocalStack replacement tested for this repo.
- MiniStack is also viable and preserves the full local CDK deploy model, with different tradeoffs.
- CloudMock and FakeCloud only worked in reduced hybrid local-dev shapes.
- MicroCloud and LocalCloud were rejected outright.

## Comparison

| Branch | Verdict | Working shape | Better than LocalStack | Worse than LocalStack |
| --- | --- | --- | --- | --- |
| `cmdct-6054cloudmock` | Partial fit | Hybrid: CloudMock-backed services + local app-api + local UI | No LocalStack CLI, lighter hybrid runtime, basic AWS control-plane calls worked | Full CDK deploy did not work; CloudFormation/API Gateway depth too weak |
| `cmdct-6054fakecloud` | Partial fit | Hybrid: FakeCloud DynamoDB + local app-api + local UI | Simpler runtime, fast startup, no LocalStack account/token flow | No viable EC2/CloudFormation/CDK path for the full stack |
| `cmdct-6054floci` | Viable | Full local CDK deploy with Floci + local UI | Closest drop-in replacement, preserved the CDK-shaped architecture, no LocalStack CLI | Needed repo-specific fixes, root container, host wiring, and non-persistent state |
| `cmdct-6054ministack` | Viable | Full local CDK deploy with MiniStack + local UI | Preserved the CDK-shaped architecture, no LocalStack CLI/account/dashboard | Needed several repo-specific CDK/runtime fixes and a fresh container each run |
| `cmdct-6054microcloud` | Rejected | None | Real private-cloud strengths, real storage/networking/VM model | Not an AWS emulator at all; wrong platform and wrong abstraction level |
| `cmdct-6054localcloud` | Rejected | None | None observed for SEDS | Name collision, unavailable emulator repo, and no Lambda/API Gateway/CloudFormation fit |

## Recommendation

If the goal is to keep the existing SEDS local architecture, the shortlist is:

1. Floci
2. MiniStack

If the team is willing to accept a hybrid local-server architecture, CloudMock and FakeCloud are still usable in narrower roles.

MicroCloud and LocalCloud should be treated as documented rejections for this repo.
