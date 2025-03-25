# MDCT SEDS (CHIP Statistical Enrollment Data System)

[![CodeQL](https://github.com/Enterprise-CMCS/macpro-mdct-seds/actions/workflows/codeql-analysis.yml/badge.svg?branch=master)](https://github.com/Enterprise-CMCS/macpro-mdct-seds/actions/workflows/codeql-analysis.yml)
[![Maintainability](https://api.codeclimate.com/v1/badges/6dd9a7765a10a72867f2/maintainability)](https://codeclimate.com/repos/64497017eab34100ce938fe6/maintainability)
[![Test Coverage](https://api.codeclimate.com/v1/badges/6dd9a7765a10a72867f2/test_coverage)](https://codeclimate.com/repos/64497017eab34100ce938fe6/test_coverage)

### Integration Environment Deploy Status:

| Branch     | Build Status                                                                                                            |
| ---------- | ----------------------------------------------------------------------------------------------------------------------- |
| master     | ![deploy](https://github.com/Enterprise-CMCS/macpro-mdct-seds/actions/workflows/deploy.yml/badge.svg)                   |
| val        | ![deploy](https://github.com/Enterprise-CMCS/macpro-mdct-seds/actions/workflows/deploy.yml/badge.svg?branch=val)        |
| production | ![deploy](https://github.com/Enterprise-CMCS/macpro-mdct-seds/actions/workflows/deploy.yml/badge.svg?branch=production) |

SEDS is the CMCS MDCT application for collecting state data related to Medicaid and CHIP quarterly enrollment data on a quarterly basis. The collected data assists CMCS in monitoring, managing, and better understanding Medicaid and CHIP programs.

## Architecture

![Architecture Diagram](./.images/architecture.svg?raw=true)

## Git Policies, Activities and Notes

Stack Name Requirements: A service name should only contain alphanumeric characters (case sensitive) and hyphens. The should start with an alphanumeric character and shouldn't exceed 128 characters.

Please push your code to a new branch with a name that meets the Stack Name Requirements above. Any other variations and the GitHub Actions will fail.

After creating a branch, if you need to rename it because it does not follow the rules above, use

`git branch -m <new-branch-name>` to rename your local branch then

`git push origin -u <new-branch-name>` to rename your remote branch in GitHub.

This project uses a combination of Gitflow and Stack naming to handle branches and merging. Branches should be prefixed with the type followed by a descriptive name for the branch. For example:

- master > feature-my-feature-name
- master > bugfix-my-bugfix-name
- master > hotfix-my-hotfix-name

On each PR, a linter and prettier check runs. These checks must pass for a PR to be merged. Prior to submitting your PR, run the linter and prettier against the work you have done.

- Run Eslint using `yarn lint`
- Run Prettier using `npx prettier --write .`

## Local Dev

### Running MDCT Workspace Setup

Team members are encouraged to setup all MDCT Products using the script located in the [MDCT Tools Repository](https://github.com/Enterprise-CMCS/macpro-mdct-tools). Please refer to the README for instructions running the MDCT Workspace Setup. After Running workspace setup team members can continue in this README for instructions on running the application locally.

#### For developers that have run workspace setup running the applicaiton locally please run the following

1. cd ~/Projects/macpro-mdct-seds/
2. `./run local --update-env` or `./run local`

   note: the `./run local --update-env` command will reach out to 1Password to bring in secret values and populate .env files that are git ignored. If you use the `./run local` command you will need to have either previously run with the `--update-env flag` or provide your own .env files.

#### For developers that cannot run the workspace setup script or wish to only run SEDS see steps below.

If you do not set don't have yarn, nvm, or java installed, see [Requirements](#requirements)

Ensure you either have a 1Password account and have 1Password CLI installed. Alternatively, reach out to the team for an example of .env files.

From the root directory run:

`nvm use`

`yarn install`

`cd services/ui-src`

`yarn install`

`cd ../../`

`./run local --update-env` or `./run local` if you do not have a 1password account and have a .env file populated by hand.

See the Requirements section if the command asks for any prerequisites you don't have installed.

Local dev is configured in typescript project in [src/](src/). The entrypoint is [src/run.ts](src/run.ts), it manages running the moving pieces locally: the API, the database, the file storage, and the frontend.

Local dev is built around the Serverless plugin [`serverless-offline`](https://github.com/dherault/serverless-offline). This plugin runs an API gateway locally configured by `./services/app-api/serverless.yml` and hot reloads your lambdas on every file save. The plugin [`serverless-dynamodb-local`](https://github.com/99x/serverless-dynamodb-local) stands up the local Database in a similar fashion.

Local authentication bypasses Cognito. The frontend mimics login in local storage with a mock user and sends an id in the `cognito-identity-id` header on every request. `serverless-offline` expects that and sets it as the cognitoId in the requestContext for your lambdas, just like Cognito would in AWS.

### Logging in

(Make sure you've finished setting up the project locally above before moving on to this step!)

Once you've run `./run local` you'll find yourself on a login page at localhost:3000. For local development there is a list of users that can be found at services/ui-auth/libs/users.json. That's where you can grab an email to fill in.

For a password to that user, please ask a fellow developer.

### Adding or modifying user roles

The external SAML IDP passes roles to cognito on login.

An issue occured with the following configuration:

- Cognito is limited to 2048 characters in an attribute.
- Users may request a large amount of roles with the IDP and power users were able to fail the login process by having too many

To avoid this issue, the IDP now filters the roles passed through by the prefix "CHIP\_". To add new roles outside of that prefix, a SR will need to be made to modify that rule.

### Adding New Endpoints

1. In [services/app-api/serverless.yml](services/app-api/serverless.yml), add a new entry to `functions` describing the new endpoint. Make sure your http method is set correctly. For example:

```
functions:
    getUsers:
        handler: handlers/users/list.main
        role: LambdaApiRole
        events:
        - http:
            path: users
            method: get
            cors: true
            authorizer: ${self:custom.authValue.${self:custom.stage}, ""}
```

2. Create a handler in [services/app-api/handlers](services/app-api/handlers)
   1. Note: For Table names use the custom variables located in [services/app-api/serverless.yml](services/app-api/serverless.yml)
   2. Conventions:
      1. Each file in the handler directory should contain a single function called 'main'
      2. The handlers are organized by API, each with their own folder. Within those folders should be separate files per HTTP verb.
         For instance: There is a `users` folder in handlers, ([services/app-api/handlers/users/](services/app-api/handlers/users/)). That folder would have individual files corresponding to an HTTP verb (e.g. `get.js` `create.js` `update.js` `delete.js`, etc.).
         The intention of this structure is that each request verb within a folder interacts with the table sharing the folder's name.
3. Add a wrapper function in [/services/ui-src/src/libs/api.js](/services/ui-src/src/libs/api.js)
   example:

```
export function listUsers() {
  const opts = requestOptions();
  return API.get("amendments", `/users`, opts);
}
```

### Adding New Forms (quarterly)

1. If necessary, create a new form template for the year in [services/database/data/initial_data_load/](services/database/data/initial_data_load/)
   1. Example: `form_questions_2022.json`
2. Add the new form to seed > form-questions > sources in [services/database/handlers/seed](./services/database/handlers/seed/)

   Example:

   ```form-questions:
    table: ${self:custom.stage}-form-questions
    sources:
    [
    data/initial_data_load/form_questions_2022.json,
    data/initial_data_load/form_questions_2021.json,
    data/initial_data_load/form_questions_2020.json,
    data/initial_data_load/form_questions_2019.json,
    ]
   ```

3. Log in to the site as an Administrator
4. Select `Generate Quarterly Forms`
5. Select the Year and Quarter for which you wish to generate forms
6. Click the `Generate Forms` button

### SEDS & CARTS

SEDS feeds updates about its submissions to BigMac, and [MDCT CARTS](https://github.com/Enterprise-CMCS/macpro-mdct-carts) ingests those for calculations. See [services/stream-functions](services/stream-functions) for the implentation.

### Legacy SEDS import SQL Files

SEDS has imported data from previous years, from the legacy SEDS project. The SQL Queries used can be
found in [src/dms](src/dms).

### Running the frontend unit test suite

1. Navigate to the frontend
   - `cd services/ui-src`
2. Launch the test for ui-src tests.
   - Run `yarn test`

### Running the integration test suite

1. Launch cypress and select the file you want to run
   - Run `yarn test:cypress`

### Running Schema Validation

Validate json files against schema to ensure accuracy before each commit.

- Schema Location: [src/database/schema/](src/database/schema/)
- Initial Data Location: [services/database/data/initial_data_load](services/database/data/initial_data_load)

1. Install AJV globally in your environment
   1. `npm install -g ajv-cli`
2. Run validate command
   1. `ajv -s /path/to/schema.json -d /path/to/json.json`

## Requirements

Node - seds enforces using a specific version of node, specified in the file `.nvmrc`. This version matches the Lambda runtime. We recommend managing node versions using [NVM](https://github.com/nvm-sh/nvm#installing-and-updating).

**The remaining steps in this section are not needed if you have the MDCT Workspace Setup Script**

Serverless - Get help installing it here: [Serverless Getting Started page](https://www.serverless.com/framework/docs/providers/aws/guide/installation/)

Yarn - in order to install dependencies, you need to [install yarn](https://classic.yarnpkg.com/en/docs/install/).

You'll also need to have java installed to run the database locally. M1 Mac users can download [from azul](https://www.azul.com/downloads/?version=java-18-sts&os=macos&architecture=x86-64-bit&package=jdk). _Note that you'll need the x86 architecture Java for this to work_. You can verify the installation with `java --version`

If you are on a Mac, you should be able to install all the dependencies like so:

```

# install nvm

curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.37.2/install.sh | bash

# select the version specified in .nvmrc

nvm install
nvm use

# install yarn

brew install yarn

# run dev

./run local

```

## Dependencies

None.

## Examples

None.

## Contributing / To-Do

See current open [issues](https://github.com/mdial89f/quickstart-serverless/issues) or check out the [project board](https://github.com/mdial89f/quickstart-serverless/projects/1).

Please feel free to open new issues for defects or enhancements.

To contribute:

- Fork this repository
- Make changes in your fork
- Open a pull request targeting this repository

Pull requests are being accepted.

## Slack Webhooks:

This repository uses 3 webhooks to publish to 3 different channels all in CMS Slack.

- SLACK_WEBHOOK: This pubishes to the `macpro-mdct-seds-alerts` channel. Alerts published there are for deploy or test failures to the `master`, `val`, or `production` branches.

- INTEGRATIONS_SLACK_WEBHOOK: This is used to publish new pull requests to the `mdct-integrations-channel`

- PROD_RELEASE_SLACK_WEBHOOK: This is used to publish to the `mdct-prod-releases` channel upon successful release of Seds to production.

  - Webhooks are created by CMS tickets, populated into GitHub Secrets

## GitHub Actions Secret Management:

- Secrets are added to GitHub secrets by GitHub Admins
- Development secrets are maintained in a 1Password vault

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

### Contributors

This project made possible by the [Serverless Stack](https://serverless-stack.com/) and its authors/contributors. The extremely detailed tutorial, code examples, and serverless pattern is where this project started.
