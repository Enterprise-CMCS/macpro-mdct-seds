# End To End Testing

In SEDs we use [Playwright] (https://playwright.dev/) for End-to-End (E2E) testing

- Playwright is an open source testing tool for web applications
- We define End-to-End (E2E) testing as a software testing methodology that validates a fully integrated system and its workflows from the beginning to the end.

## Configuration

Playwright is configured in `playwright.config.ts`.

- See [Playwright Configuration Docs](https://playwright.dev/docs/test-configuration)

## Writing Tests

- Tests are written in TypeScript and are located in the `tests/e2e/` directory
- Test files use the ``.spec.ts` extension.

## Executing The Tests

### Setup

Before running the tests ensure the following has been done:

#### Verify that you have an up to date .env

- Run `./run update-env` from the project root

#### Install browsers

- Run `yarn playwright install --with-deps chromium` of of the `tests/` directory

### Run The Tests

#### Headless

- Run `yarn playwright test` out of the `tests/` directory

#### With Testing UI

- Run `yarn playwright test --ui` out of the `tests/` directory
