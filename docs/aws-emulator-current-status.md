# SEDS AWS Emulator Evaluation Status

This is the current short-form status for the `CMDCT-6054` AWS emulator evaluation work.

## Eliminated or Partial-Fit Tools

| Tool           | Status           | Reason                                                                                                           |
| -------------- | ---------------- | ---------------------------------------------------------------------------------------------------------------- |
| **CloudMock**  | Partial fit only | Worked only in a hybrid setup with local `app-api` and local UI. The full CDK deploy path was not strong enough. |
| **FakeCloud**  | Partial fit only | Usable for DynamoDB-backed local state, but not for the EC2 / CloudFormation / CDK path SEDS needs.              |
| **MicroCloud** | Rejected         | Not an AWS emulator; wrong platform and abstraction level for this repo.                                         |
| **LocalCloud** | Rejected         | Wrong or unavailable product, and not a fit for Lambda / API Gateway / CloudFormation.                           |

## Still In The Running

| Tool          | Status               | Notes                                                                                                                                                     |
| ------------- | -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Floci**     | Active candidate     | Strongest option from the original evaluation set. Preserved the CDK-shaped local architecture and was validated end to end.                              |
| **MiniStack** | Active candidate     | Viable backup from the original evaluation set. Also worked end to end, but needed more repo-specific fixes and preferred a fresh container each run.     |
| **LocalEmu**  | Active later entrant | Implemented in its own branch and not explicitly rejected. It appears to have entered the evaluation after the original six-tool comparison was narrowed. |

## Practical Reading

1. **Floci** is the latest clearly recorded leader from the original comparison set.
2. **MiniStack** is the latest clearly recorded backup from that same set.
3. **LocalEmu** should be treated as an active newer candidate unless a later decision memo rejects it explicitly.
