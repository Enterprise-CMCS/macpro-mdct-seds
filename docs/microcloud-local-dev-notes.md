# MicroCloud Local Dev Notes

Date: 2026-05-19

This document captures the `CMDCT-6054` evaluation of replacing LocalStack with MicroCloud for SEDS local development.

## Summary

MicroCloud is not a viable LocalStack replacement for this repo.

The reason is structural, not just tooling friction. MicroCloud is a private cloud platform built from LXD, MicroCeph, and MicroOVN. SEDS local development depends on a LocalStack-style AWS emulator path driven by `cdklocal`, CloudFormation, Lambda, API Gateway, DynamoDB, EC2/VPC primitives, IAM, S3 bootstrap assets, and Secrets Manager.

MicroCloud does not provide those AWS service emulations. The closest overlap is that MicroCeph can expose S3-compatible object storage through RGW, but that only covers object storage and does not make MicroCloud an AWS emulator.

## Repo Requirements That Matter

The current `./run local` path in this repo depends on all of the following:

- `cdklocal bootstrap`
- `cdklocal deploy`
- CloudFormation stack create/update/readback
- Lambda deployment and invocation
- API Gateway deployment and routing
- DynamoDB tables and streams
- EC2/VPC/subnet/security-group resources
- Secrets Manager for local default secrets
- S3 for CDK asset publishing

That is visible directly in this repo's local and deployment code:

- `cli/commands/local.ts`
- `deployment/local/prerequisites.ts`
- `deployment/prerequisites.ts`
- `deployment/stacks/parent.ts`
- `deployment/stacks/api.ts`
- `deployment/constructs/lambda.ts`

## What I Verified

- This branch starts from the original LocalStack-based local path.
- The current workstation is macOS:
  - `uname -a` reported `Darwin`
- `microcloud` is not installed on this machine:
  - `microcloud --help` returned `command not found`
- `snap` is not installed on this machine:
  - `snap info microcloud` returned `command not found`
- Official MicroCloud install docs require:
  - Ubuntu 22.04 or newer
  - `snapd`
  - installation of the `lxd`, `microceph`, `microovn`, and `microcloud` snaps
- Official MicroCloud docs describe it as a private cloud composed of:
  - LXD for virtualization
  - MicroCeph for storage
  - MicroOVN for networking
- Official MicroCeph docs confirm the only AWS-adjacent capability here is optional RGW object storage with an S3-compatible gateway.

## Pain Points And Limitations

- MicroCloud is not an AWS emulator.
- It does not offer CloudFormation semantics needed by `cdklocal`.
- It does not provide Lambda, API Gateway, DynamoDB, IAM, or Secrets Manager compatibility for this repo.
- The repo's local stack depends heavily on EC2/VPC-style constructs, while MicroCloud's networking model is OVN/LXD-oriented rather than AWS API-compatible.
- Even the one overlapping area, S3-compatible object storage, is not enough to preserve the current local architecture.
- The local workstation constraint is also real: MicroCloud's documented install path is Ubuntu-plus-snaps, not macOS.

## Better Than LocalStack

If the goal were a small private cloud rather than AWS emulation, MicroCloud has real strengths:

- It provides actual VM and system-container hosting through LXD.
- It provides real distributed storage through MicroCeph.
- It provides real cluster networking through MicroOVN.
- It is designed for high availability, clustering, and multi-tenancy.
- It can expose S3-compatible object storage through RGW.

Those are legitimate advantages, but they are advantages in a different problem space.

## Worse Than LocalStack

For this repo and this ticket, MicroCloud is worse than LocalStack in every important dimension:

- It is not a drop-in AWS emulator.
- It cannot preserve the current `cdklocal` workflow.
- It does not map to the repo's Lambda/API Gateway/DynamoDB/CloudFormation-based local model.
- It has a much heavier deployment model than LocalStack.
- Its documented installation path targets Ubuntu with snaps, not this macOS workstation.
- Its networking and storage assumptions are cluster-oriented, not laptop-oriented.

## Recommendation

Treat MicroCloud as rejected for `CMDCT-6054`.

If SEDS wanted to use MicroCloud at all, it would need a fundamentally different local-development architecture. That would be a redesign around LXD-hosted application services and possibly Ceph-backed object storage, not a LocalStack replacement.

For the actual requirement in this repo, MicroCloud is effectively DOA.

## Sources

- MicroCloud overview: https://documentation.ubuntu.com/microcloud/stable/microcloud/
- MicroCloud install requirements: https://documentation.ubuntu.com/microcloud/latest/microcloud/how-to/install/
- MicroCloud requirements: https://documentation.ubuntu.com/microcloud/latest/reference/requirements/
- MicroCeph S3-compatible RGW tutorial: https://documentation.ubuntu.com/microcloud/default/microceph/tutorial/get-started/
- MicroCeph architecture: https://documentation.ubuntu.com/microcloud/latest/microceph/explanation/microceph-architecture/
