# MDCT SEDS (CHIP Statistical Enrollment Data System)

SEDS is the CMCS MDCT application for collecting state data related to Medicaid and CHIP quarterly enrollment data on a quarterly basis. The collected data assists CMCS in monitoring, managing, and better understanding Medicaid and CHIP programs.

[![CodeQL](https://github.com/Enterprise-CMCS/macpro-mdct-seds/actions/workflows/codeql-analysis.yml/badge.svg?branch=main)](https://github.com/Enterprise-CMCS/macpro-mdct-seds/actions/workflows/codeql-analysis.yml)
[![Maintainability](https://qlty.sh/badges/60b58f10-b174-450a-8a61-579cb24dd6d5/maintainability.svg)](https://qlty.sh/gh/Enterprise-CMCS/projects/macpro-mdct-seds)
[![Code Coverage](https://qlty.sh/badges/60b58f10-b174-450a-8a61-579cb24dd6d5/test_coverage.svg)](https://qlty.sh/gh/Enterprise-CMCS/projects/macpro-mdct-seds)

### Integration Environment Deploy Status:

| Branch     | Build Status                                                                                                            |
| ---------- | ----------------------------------------------------------------------------------------------------------------------- |
| main       | ![deploy](https://github.com/Enterprise-CMCS/macpro-mdct-seds/actions/workflows/deploy.yml/badge.svg)                   |
| val        | ![deploy](https://github.com/Enterprise-CMCS/macpro-mdct-seds/actions/workflows/deploy.yml/badge.svg?branch=val)        |
| production | ![deploy](https://github.com/Enterprise-CMCS/macpro-mdct-seds/actions/workflows/deploy.yml/badge.svg?branch=production) |

## Architecture

![Architecture Diagram](./.images/architecture.svg?raw=true)

## Git Policies

### Branch Naming

Branch name requirements:
Every origin branch has an automatically-created AWS stack.
The stack's resources (s3 buckets, lambdas, dynamo tables, and so on)
will include the branch name (to distinguish them from other stacks' resources).
Therefore, the branch name must be very short: 32 characters or fewer.
It may contain only lowercase letters, numbers, or hyphens.

Branch name recommendations:
The best branch names are meaningful.
The purpose of branch `upgrade-amplify` is clearer than branch `cmdct-3748`.
There is no automatic processing based on branch name,
so story numbers or tags like `hotfix-` are not required.

If your branch name does not meet requirements,
you may "rename" it by creating a new branch at the same commit
(deleting the old branch as necessary).

```sh
git checkout Invalid/BranchName
git checkout -b good-branch-name
git push
```

Note: We highly recommend `git config --global push.autosetupremote true`,
so that `git push` will automatically create and track an origin branch.

### Linting and Formatting

Before a PR can be merged, it must pass `oxlint` and `oxfmt` checks.

- These will be executed by Github Actions on PR creation
- They should also run locally, automatically on each commit,
  if your pre-commit hooks have been set up correctly.
- You may also wish to set them up to run automatically on each file save.
- You can also invoke them manually.
  The `--deny-warnings` flag ensures warnings cause a non-zero exit code.
  ```sh
  yarn oxlint --deny-warnings
  yarn oxfmt
  ```

### Approvals

Every PR should pass automated checks and be approved by two team members.

Feature branches are squash-merged into `main`.

The team lead will merge (**not squash!**) `main` -> `val` -> `production`
on a regular basis.

## Local Dev

### Running MDCT Workspace Setup

Team members are encouraged to setup all MDCT Products using
the script located in the [MDCT Tools Repository](https://github.com/Enterprise-CMCS/macpro-mdct-tools).
Please refer to the README for instructions running the MDCT Workspace Setup.

Alternatively, you may install the various requirements yourself.
The best way to do this is by following the workspace setup script,
skipping the commands you can't or don't need to run.
The critical dependencies are `colima`, `localstack`, `nvm`, and `corepack`.
We use `nvm` to manage the version of `node`
and `corepack` to manage the version of `yarn`
(referring to the repo's `.nvmrc` and `package.json` files respectively).

Please consider the setup script to be authoritative.
With that said, these commands _should_ set up those dependencies
(if you are on a Mac).

```sh
brew install colima
brew install localstack/tap/localstack-cli
brew install nvm
nvm install
npm install --global corepack
```

Note that this should be the _only_ time you invoke `npm` within this repo.
For all other scripts and JS dependency management, please use `yarn`.

### Set up Environment file

You may generate a `.env` file with this command:

```sh
./run update-env
```

This uses the template file `.env.tpl`,
which contains a mix of literal values and 1Password keys.
Those keys will be used to fetch secrets from the teams's 1Password vault.

If you do not yet have 1Password set up,
ask a team member to send you their .env file to use in the meantime.

### Run the App

Now you should be able to start the app with

```sh
./run local
```

This will:

1. Start up Colima, a fully open-source Docker alternative.
2. Start up Localstack, an Amazon Web Services (AWS) cloud emulator, in Colima.
3. Deploy SEDS to the Localstack container.
   - Doing so by running the code in this repo's deployment folder.
   - Which makes a CloudFormation file with the AWS Cloud Development Kit (CDK).
4. Open a tab in your browser, pointed to the SEDS server inside the container.

### Log in

Although production users access SEDS through the CMS SSO system,
for testing and local development we generally use username & password.

The username may be any of the emails in services/ui-auth/libs/users.json.
The password may be found in the AWS Secrets Manager,
or in the team 1Password vault,
or by asking one of your teammates.

SEDS is unique among MDCT apps, in that the SSO token we receive from CMS
does not indicate which U.S. state the user is associated with,
and does not contain enough information for us to be certain of the user's role.
Therefore, the first time a user logs in,
we record them in our DB with our best guess as to their role,
which may be modified after the fact by an admin user.
If we infer the user to be a state user,
we will redirect them (on their first login only)
to a page where they must select a state.

During local testing, it does not matter which state you pick for your user.
There is no special behavior for different states,
and they should all be seeded with equivalent data.

### View Local Resources

Although the app is running in a container on your machine,
you must open (https://app.localstack.cloud/)[https://app.localstack.cloud/]
in your browser to inspect the resources.

You may be asked to pick a plan.
Because SEDS is open-source, it qualifies as a "Hobby" project.
You may also need to `localstack auth set-token <your token>`.
Find your token on [Localstack's Getting Started page](https://app.localstack.cloud/getting-started).

When this is set up, you will be able to see Cloudwatch logs and DynamoDB data.
However, there are many services Localstack does not support at the Hobby tier,
or does support but doesn't provide visibility into.
For these, you may need to push your branch.
It will automatically deploy to an AWS stack in our dev environment,
and you will have access to the full AWS web UI.

### Running tests

We have unit tests for the API (services/app-api) and UI (services/ui-src).
To run those tests, `cd` into the appropriate directory and `yarn test`.

By default, tests run in watch mode.
To run once and exit, add the `--run` option.
To analyze test coverage, add the `--coverage` option.
We focus on line coverage (not statement, branch, or function coverage).

Before a PR can be merged, it must:

1. Have 90% or better unit test coverage across all changed lines.
2. Not decrease the overall test coverage of the app.

Unfortunately there is no direct way to check these two rules locally.
If you believe you have sufficient coverage on a given branch,
push the branch and create a PR.
The coverage will be confirmed as a PR check.

<!-- TODO: Update with Playwright E2E integration test instructions -->

## Cloud organization and access

SEDS has three AWS environments: development, validation, and production.
These correspond to the three permanent branches.
The val and production branches are the only stacks in their environments.
The dev environment has the `main` stack,
but also contains temporary stacks for any in-progress features.

Pushing a new branch to the origin repo will automatically deploy it to dev.

To view the AWS resources for a stack, go to [https://cloudtamer.cms.gov/](https://cloudtamer.cms.gov/).
The three SEDS environments are named "MDCT Dev", "MDCT Val" and "MDCT Prod"
(whereas other MDCT apps' environment names include the app name).
From here, you can select a role (readonly or admin)
and an access method (the web UI or temporary keys).

## Major Dependencies

- Amazon Web Services
  - The app is deployed by CloudFormation, using CDK
  - The frontend is served by Cloudfront
  - The fontend connects to the backend through Amplify
  - The backend code runs on Lambdas, invoked by API Gateway
  - The data is stored in DynamoDB
  - The logs are stored in Cloudwatch
  - Authentication goes through Cognito
  - And so on
- NodeJS / Typescript
  - The backend code runs on Node
  - Deployment and testing (frontend and backend) run on Node
  - Prefer Typescript for all new code (including "devops"-type scripts wherever reasonable)
- React is the frontend framework, with React Router structuring the SPA
- Yarn is the package manager and script runner
- Vite builds and bundles the frontend
- Vitest is the unit test runner
- Testing Library and jsdom interact with the DOM in frontend unit tests
- Kafka is the data egress system
- `@cmsgov/design-system` (CMSDS) is used for some components and the site theme
- FontAwesome is used for some icons
- Zustand is the frontend data store
- Oxlint and Oxfmt are the linter and formatter

## Adding or modifying user roles

The external SAML IDP passes roles to cognito on login.

An issue occured with the following configuration:

- Cognito is limited to 2048 characters in an attribute.
- Users may request a large amount of roles with the IDP and power users were able to fail the login process by having too many

To avoid this issue, the IDP now filters the roles passed through by the prefix "CHIP\_". To add new roles outside of that prefix, a SR will need to be made to modify that rule.

## Adding New Endpoints

1. In `deployment/stacks/api.ts`, declare the new lambda.
   This will define code file path & entry point, HTTP path & method, and so on.
2. Create a handler in [services/app-api/handlers](services/app-api/handlers),
   following the conventions you see in other handlers.
3. Add a wrapper function in [services/ui-src/src/libs/api.ts](services/ui-src/src/libs/api.ts)

## Form Generation and Table Structure

SEDS collects data on a quarterly basis.
To support this, we generate empty forms 4 times a year;
see the `generateQuarterFormsOnSchedule` lambda in deployment/stacks/api.ts.

This process involves four tables:

1. `form-templates`, which has one entry per year, containing all question data.
   If there is no entry for this year,
   the previous year's entry is copied & automatically modified.
2. `form-questions`, which also holds all the form question data each year.
   If this year has no questions, they will be copied from `form-templates`.
3. `state-forms`, which holds status (etc) for each state & quarter & form type.
   Therefore we generate about 1200 new entries per year,
   and update them as users update the forms.
4. `form-answers`, which holds the user-entered data.
   There is one entry for each state form & question & age range.
   Therefore we generate about 30,000 new entries per year,
   filling them in as users fill in the answers.

Note that updating the question data in `form-templates`
may take up to a year before any user sees the changes,
because of the indirectness of the above process.

## Annual Recurring Development Tasks

None.

Beyond, of course, ensuring the app is free of security vulnerabilities.

## SEDS & CARTS

SEDS sends all of its data through BigMac's Kafka instance.
There are two systems listening for this data:

1. Our integration partner DataConnect, which digests the data for CMS
2. [MDCT CARTS](https://github.com/Enterprise-CMCS/macpro-mdct-carts),
   which uses the enrollment data in its own system.

This is implemented via [AWS Event Source Mapping](https://docs.aws.amazon.com/lambda/latest/dg/invocation-eventsourcemapping.html),
which listens for changes in our DynamoDB tables
and invokes our postKafkaData lambda when updates occur.

## Legacy SEDS import SQL Files

SEDS has imported data from previous years, from the legacy SEDS project.
The SQL Queries used can be found in [this commit](https://github.com/Enterprise-CMCS/macpro-mdct-seds/commit/1786f8ae5cb476eb7e507824b036498732acd503).

## Slack Webhooks:

This repository uses 3 webhooks to publish to 3 different channels all in CMS Slack.

- SLACK_WEBHOOK: This pubishes to the `macpro-mdct-seds-alerts` channel. Alerts published there are for deploy or test failures to the `main`, `val`, or `production` branches.

- INTEGRATIONS_SLACK_WEBHOOK: This is used to publish new pull requests to the `mdct-integrations-channel`

- PROD_RELEASE_SLACK_WEBHOOK: This is used to publish to the `mdct-prod-releases` channel upon successful release of Seds to production.
  - Webhooks are created by CMS tickets, populated into GitHub Secrets

## GitHub Actions Secret Management:

- Secrets are added to GitHub secrets by GitHub Admins
- Development secrets are maintained in a 1Password vault
- Secrets used during deployment may be found in AWS Secret Manager

## Deployment

While application deployment is generally handled by Github Actions, when you initially set up a new AWS account to host this application, you'll need to deploy a prerequisite stack like so:

```bash
./run deploy-prerequisites
```

That will create a stack called `seds-prerequisites` which will contain resources needed by any application stacks.

## License

[![License](https://img.shields.io/badge/License-CC0--1.0--Universal-blue.svg)](https://creativecommons.org/publicdomain/zero/1.0/legalcode)

See [LICENSE](LICENSE.md) for full details.

```text
As a work of the United States Government, this project is
in the public domain within the United States.

Additionally, we waive copyright and related rights in the
work worldwide through the CC0 1.0 Universal public domain dedication.
```
