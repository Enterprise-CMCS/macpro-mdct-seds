[cms-mdct-seds](https://github.com/CMSgov/cms-mdct-seds) ![Build](https://github.com/CMSgov/cms-mdct-seds/workflows/Build/badge.svg?branch=master)[![latest release](https://img.shields.io/github/release/cmsgov/macpro-quickstart-serverless.svg)](https://github.com/cmsgov/cms-mdct-seds/releases/latest) [![Maintainability](https://api.codeclimate.com/v1/badges/df4bb29388dee162e0e5/maintainability)](https://codeclimate.com/github/CMSgov/cms-mdct-seds/maintainability)

# MACPro Data Collection Tool: CHIP Statistical Enrollment Data System

Welcome to the Centers for Medicare & Medicaid MACPro Data Collection Tool (MDCT) CHIP Statistical Enrollment Data System (SEDS). MDCT SEDS is a serverless form submission application built and deployed to AWS within the Serverless Application Framwork. Is it based on:

## Architecture

![Architecture Diagram](./.images/architecture.svg?raw=true)

## Git Policies, Activities and Notes

Serverless Name Requirements: A service name should only contain alphanumeric characters (case sensitive) and hyphens. The should start with an alphanumeric character and shouldn't exceed 128 characters.

Please push your code to a new branch with a name that meets the Serverless Name Requirements above. Any other variations and the Github Actions will fail.

After creating a branch, if you need to rename it because it does not follow the rules above, use `git branch -m <new-branch-name>` to rename your local branch then `git push origin -u <new-branch-name>` to rename your remote branch in GitHub.

This project uses a combination of gitflow and serverless naming to handle branches and merging. Branches should be prefixed with the type followed by a descriptive name for the branch. For example:

- master > feature-my-feature-name
- master > bugfix-my-bugfix-name
- master > hotfix-my-hotfix-name

On each PR, a linter and prettier check is run. These checks must pass for a PR to be merged. Prior to submitting your PR, you will need to run the linter and prettier against the work you have done.

- Run Eslint using `yarn lint`
- Run Prettier using `npx prettier --write .`

## Usage

See master build for the MACPro Quickstart [here](https://github.com/CMSgov/macpro-quickstart-serverless/actions?query=branch%3Amaster)

This application is built and deployed via GitHub Actions.

Want to deploy from your Mac?

- Create an AWS account
- Install/configure the AWS CLI
- npm install -g severless
- brew install yarn
- sh deploy.sh

Want to deploy from Windows using a VM?

- Install Ubuntu WSL on Windows 10
- In a new Ubuntu terminal, run the following commands:
- Add new id_rsa.pub
- ssh-keygen (Leave all defaults and hit enter until done)
- Copy and add public key to git
- sudo tail ~/.ssh/id_rsa.pub
- In your GitHub profile, add the id_rsa to ssh keys
- Run `git clone git@github.com:CMSgov/cms-mdct-seds.git`
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

From the repository directory, run all the services locally with the command `./dev local`

See the Requirements section if the command asks for any prerequisites you don't have installed.

Local dev is configured in typescript project in `./src`. The entrypoint is `./src/dev.ts`, it manages running the moving pieces locally: the API, the database, the filestore, and the frontend.

Local dev is built around the Serverless plugin [`serverless-offline`](https://github.com/dherault/serverless-offline). `serverless-offline` runs an API gateway locally configured by `./services/app-api/serverless.yml` and hot reloads your lambdas on every save. The plugins [`serverless-dynamodb-local`](https://github.com/99x/serverless-dynamodb-local) and [`serverless-s3-local`](https://github.com/ar90n/serverless-s3-local) stand up the local db and local s3 in a similar fashion.

When run locally, auth bypasses Cognito. The frontend mimics login in local storage with a mock user and sends an id in the `cognito-identity-id` header on every request. `serverless-offline` expects that and sets it as the cognitoId in the requestContext for your lambdas, just like Cognito would in AWS.

### Adding New Endpoints

1. In `{ROOT}/services/appi-api/serverless.yml`, add new entry to `functions` describing the new endpoint.
   Hint: Make sure your http method is set correctly
   example:

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
            authorizer: aws_iam
```

2. Create handler in `{ROOT}/services/app-api/handlers`
   1. Note: For Table name use custom vars located in `{ROOT}/services/app-api/serverless.yml`
   2. Conventions:
      1. Each file in the handler directory should contain a single function called 'main'
      2. The handlers are organized by API, each with their own folder. Within those folders should be separate files for each HTTP verb.
         For instance: There might be `users` folder in handlers, (`app-api/handlers/users`). Within that `users`folder would be individual files each corresponding with an HTTP verb so that the inside of `users` might look like `get.js` `create.js` `update.js` `delete.js`, etc.
         The intention of this structure is that each of the verbs within a folder corresponds to the same data set in the database.
3. Add wrapper function in `{ROOT}/services/ui-src/src/lib/api.js`
   example:

```
export function listUsers() {
  const opts = requestOptions();
  return API.get("amendments", `/users`, opts);
}

### Running the nightwatch test suite

1. Navigate to the front end
   1. `cd services/ui-src`
2. Launch the test for ui-src tests.
   1. Run `yarn run nightwatch src/{dir_name}/tests`
3. Run root tests
   1. In terminal, run `export APPLICATION_ENDPOINT=http://localhost:3000`
   2. Enter `cd {ROOT}/tests/nightwatch/`
   3. Run `yarn run nightwatch`

### Running Schema Validation

Validate json files against schema to ensure accuracy before each commit.

- Schema Location: `{ROOT}/src/database/schema/`
- Initial Data Location: `{ROOT}/src/database/initial_data_load`

1. Install AJV globally in your environment
   1. `npm install -g ajv-cli`
2. Run validate command
   1. `ajv -s /path/to/schema.json -d /path/to/json.json`

## Requirements

Node - we enforce using a specific version of node, specified in the file `.nvmrc`. This version matches the Lambda runtime. We recommend managing node versions using [NVM](https://github.com/nvm-sh/nvm#installing-and-updating).

Serverless - Get help installing it here: [Serverless Getting Started page](https://www.serverless.com/framework/docs/providers/aws/guide/installation/)

Yarn - in order to install dependencies, you need to [install yarn](https://classic.yarnpkg.com/en/docs/install/).

AWS Account: You'll need an AWS account with appropriate IAM permissions (admin recommended) to deploy this app in Amazon.

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

````

## Dependencies

None.

## Examples

None.

## Contributing / To-Do

See current open [issues](https://github.com/mdial89f/quickstart-serverless/issues) or check out the [project board](https://github.com/mdial89f/quickstart-serverless/projects/1)

Please feel free to open new issues for defects or enhancements.

To contribute:

- Fork this repository
- Make changes in your fork
- Open a pull request targetting this repository

Pull requests are being accepted.

## License

[![License](https://img.shields.io/badge/License-CC0--1.0--Universal-blue.svg)](https://creativecommons.org/publicdomain/zero/1.0/legalcode)

See [LICENSE](LICENSE.md) for full details.

```text
As a work of the United States Government, this project is
in the public domain within the United States.

Additionally, we waive copyright and related rights in the
work worldwide through the CC0 1.0 Universal public domain dedication.
````

### Contributors

This project made possible by the [Serverless Stack](https://serverless-stack.com/) and its authors/contributors. The extremely detailed tutorial, code examples, and serverless pattern is where this project started. I can't recommend this resource enough.

| [![Mike Dial][dial_avatar]][dial_homepage]<br/>[Mike Dial][dial_homepage] | [![Seth Sacher][sacher_avatar]][sacher_homepage]<br/>[Seth Sacher][sacher_homepage] |
| ------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |

[dial_homepage]: https://github.com/mdial89f
[dial_avatar]: https://avatars.githubusercontent.com/mdial89f?size=150
[sacher_homepage]: https://github.com/sethsacher
[sacher_avatar]: https://avatars.githubusercontent.com/sethsacher?size=150
