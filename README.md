# MDCT SEDS (CHIP Statistical Enrollment Data System)

[![CodeQL](https://github.com/Enterprise-CMCS/macpro-mdct-seds/actions/workflows/codeql-analysis.yml/badge.svg?branch=master)](https://github.com/Enterprise-CMCS/macpro-mdct-seds/actions/workflows/codeql-analysis.yml)
[![Maintainability](https://api.codeclimate.com/v1/badges/6dd9a7765a10a72867f2/maintainability)](https://codeclimate.com/repos/64497017eab34100ce938fe6/maintainability)
[![Test Coverage](https://api.codeclimate.com/v1/badges/6dd9a7765a10a72867f2/test_coverage)](https://codeclimate.com/repos/64497017eab34100ce938fe6/test_coverage)

SEDS is the CMCS MDCT application for collecting state data related to Medicaid and CHIP quarterly enrollment data on a quarterly basis. The collected data assists CMCS in monitoring, managing, and better understanding Medicaid and CHIP programs.

## Architecture

![Architecture Diagram](./.images/architecture.svg?raw=true)

## Git Policies, Activities and Notes

Serverless Name Requirements: A service name should only contain alphanumeric characters (case sensitive) and hyphens. The should start with an alphanumeric character and shouldn't exceed 128 characters.

Please push your code to a new branch with a name that meets the Serverless Name Requirements above. Any other variations and the GitHub Actions will fail.

After creating a branch, if you need to rename it because it does not follow the rules above, use

`git branch -m <new-branch-name>` to rename your local branch then

`git push origin -u <new-branch-name>` to rename your remote branch in GitHub.

This project uses a combination of Gitflow and Serverless naming to handle branches and merging. Branches should be prefixed with the type followed by a descriptive name for the branch. For example:

- master > feature-my-feature-name
- master > bugfix-my-bugfix-name
- master > hotfix-my-hotfix-name

On each PR, a linter and prettier check runs. These checks must pass for a PR to be merged. Prior to submitting your PR, run the linter and prettier against the work you have done.

- Run Eslint using `yarn lint`
- Run Prettier using `npx prettier --write .`

## Usage

See master build for the MACPro Quickstart [here](https://github.com/Enterprise-CMCS/macpro-quickstart-serverless/actions?query=branch%3Amaster)

This application is built and deployed via GitHub Actions.

Want to deploy from your Mac?

- Create an AWS account
- Install/configure the AWS CLI
- `npm install -g serverless`
- `brew install yarn`
- `sh deploy.sh`

Want to deploy from Windows using a VM?

- Install Ubuntu WSL on Windows 10
- In a new Ubuntu terminal, run the following commands:
- Add new id_rsa.pub
- ssh-keygen (Leave all defaults and hit enter until done)
- Copy and add public key to git
- sudo tail ~/.ssh/id_rsa.pub
- In your GitHub profile, add the id_rsa to ssh keys
- Run `git clone git@github.com:Enterprise-CMCS/macpro-mdct-seds.git`
- cd into the repository directory in your VM terminal and `git checkout master`
- Install node
- Run `sudo apt update`
- Run `sudo apt upgrade`
- Run `sudo apt install nodejs`
- Install Yarn
- Run `curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | sudo apt-key add -`
- Run `echo "deb https://dl.yarnpkg.com/debian/ stable main" | sudo tee /etc/apt/sources.list.d/yarn.list`
- Run `sudo apt-get update`
- Run `sudo apt-get install yarn -y`
- Install NVM `curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.37.2/install.sh | bash`
- Add NVM to your current terminal session `source ~/.nvm/nvm.sh`
- Change Node Version `nvm install 12.20.0`
- Install Java
- Run `sudo add-apt-repository ppa:openjdk-r/ppa`
- Run `sudo apt-get update`
- Run `sudo apt install openjdk-12-jdk`
- Instal AWS CLI (Optional) `sudo apt install awscli`

## Local Dev

If you don't have yarn, nvm, or java installed, see [Requirements](#requirements)

Get the correct info for the .env file from another developer or copy the env_example to a .env and update it with the appropriate values.

From the root directory run:

`nvm use`

`yarn install`

`cd services/ui-src`

`yarn install`

`cd ../../`

`./dev local`

See the Requirements section if the command asks for any prerequisites you don't have installed.

Local dev is configured in typescript project in [src/](src/). The entrypoint is [src/dev.ts](src/dev.ts), it manages running the moving pieces locally: the API, the database, the file storage, and the frontend.

Local dev is built around the Serverless plugin [`serverless-offline`](https://github.com/dherault/serverless-offline). This plugin runs an API gateway locally configured by `./services/app-api/serverless.yml` and hot reloads your lambdas on every file save. The plugins [`serverless-dynamodb-local`](https://github.com/99x/serverless-dynamodb-local) and [`serverless-s3-local`](https://github.com/ar90n/serverless-s3-local) stand up the local Database and S3 buckets in a similar fashion.

Local authentication bypasses Cognito. The frontend mimics login in local storage with a mock user and sends an id in the `cognito-identity-id` header on every request. `serverless-offline` expects that and sets it as the cognitoId in the requestContext for your lambdas, just like Cognito would in AWS.

### Logging in

(Make sure you've finished setting up the project locally above before moving on to this step!)

Once you've run `./dev local` you'll find yourself on a login page at localhost:3000. For local development there is a list of users that can be found at services/ui-auth/libs/users.json. That's where you can grab an email to fill in.

For a password to that user, please ask a fellow developer.

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

1. If necessary, create a new form template for the year in [src/database/initial_data_load/](src/database/initial_data_load/)
   1. Example: `form_questions_2022.json`
2. Add the new form to seed > form-questions > sources in [services/data-deployment/serverless.yml](./services/data-deployment/serverless.yml)

   Example:

   ```form-questions:
    table: ${self:custom.stage}-form-questions
    sources:
    [
    ../../src/database/initial_data_load/form_questions_2022.json,
    ../../src/database/initial_data_load/form_questions_2021.json,
    ../../src/database/initial_data_load/form_questions_2020.json,
    ../../src/database/initial_data_load/form_questions_2019.json,
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
- Initial Data Location: [src/database/initial_data_load](src/database/initial_data_load)

1. Install AJV globally in your environment
   1. `npm install -g ajv-cli`
2. Run validate command
   1. `ajv -s /path/to/schema.json -d /path/to/json.json`

## Requirements

Node - we enforce using a specific version of node, specified in the file `.nvmrc`. This version matches the Lambda runtime. We recommend managing node versions using [NVM](https://github.com/nvm-sh/nvm#installing-and-updating).

Serverless - Get help installing it here: [Serverless Getting Started page](https://www.serverless.com/framework/docs/providers/aws/guide/installation/)

Yarn - in order to install dependencies, you need to [install yarn](https://classic.yarnpkg.com/en/docs/install/).

AWS Account: You'll need an AWS account with appropriate IAM permissions (admin recommended) to deploy this app in Amazon.

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

./dev local

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

This project made possible by the [Serverless Stack](https://serverless-stack.com/) and its authors/contributors. The extremely detailed tutorial, code examples, and serverless pattern is where this project started. I can't recommend this resource enough.

| [![Mike Dial][dial_avatar]][dial_homepage]<br/>[Mike Dial][dial_homepage] | [![Seth Sacher][sacher_avatar]][sacher_homepage]<br/>[Seth Sacher][sacher_homepage] |
| ------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |

[dial_homepage]: https://github.com/mdial89f
[dial_avatar]: https://avatars.githubusercontent.com/mdial89f?size=150
[sacher_homepage]: https://github.com/sethsacher
[sacher_avatar]: https://avatars.githubusercontent.com/sethsacher?size=150
