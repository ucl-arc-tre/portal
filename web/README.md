# ARC TRE portal frontent

This React + Typescript project was set up using [NextJS](https://nextjs.org).

Development files are located in '/src' with all components routed into the app folder, following conventions of [app routing](https://nextjs.org/docs/14/app/building-your-application/routing)

---

# Requirements

Make sure you have read through the root [`README.md`](../README.md) file. This will give you more background on the application architecture.

## Nodejs and npm

You need to have [Node.js](https://nodejs.org/en/download/) installed on your local development machine. Nodejs comes bundled with npm which is used for managing the libraries that are used for the frontend.

This project uses the the latest `Active` version of Node, as recommended by the [Node release schedule](https://nodejs.org/en/about/previous-releases). So make sure you are using this version of Node on your system for this project. We recommend using [NVM](https://github.com/nvm-sh/nvm) to manage local Node versions.

To install all the necessary frontend packages and libraries, run the following from the react project directory: `/web`.

```shell script
npm install
```

This will install all of the project dependencies that are specified in `web/package.json`.

## Updating packages

Dependabot has been enabled on the project repo to provide monthly package update alerts. Make sure to test these locally first before merging them in.

---

# Running e2e tests

This project uses the [Cypress](https://www.cypress.io/) testing framework for running e2e tests. [Accessibility testing](https://docs.cypress.io/app/guides/accessibility-testing) is incorporated into Cypress with the [cypress-axe extension](https://www.npmjs.com/package/cypress-axe).

## Running tests locally

Tests can be run against both the dockerised local dev environment as well as the full dockerised release production build.

Failing tests will produce downloadable screenshots saved in `/web/cypress/screenshots` to make debugging test failures easier. Make sure not to commit this folder to git.

### End-to-end (e2e) tests

Authenticated end-to-end tests require EntraID usernames and passwords to be set in a `cypress.env.json` file. Create it based on [cypress.sample.env.json](./cypress.sample.env.json).

Two sets of credentials will be needed to simulate both an admin user and a user with a base role during tests. To generate these credentials, speak to a senior team member.

### e2e testing the dev build

The easiest way to run the full e2e testing suite is with the following command from the project root directory:

```
make test-e2e-dev
```

This will run all frontend tests in headless mode against the dockerised dev server running on `localhost:8000`.

If you want to run the tests with the cypress UI while the dev server is running, you can run:

```shell script
npm run cypress:open
```

### e2e testing the release production build

Run the following command from the project root directory:

```
make test-e2e-release
```

These tests simulate the full production build of the application.

## Running tests in CI

The e2e tests are also configured to run during CI via a GitHub action workflow.

The CI tests are run against the full release version of the dockerised setup to test against the production version of the application.

## Testing against multiple browsers

The local tests will run against Chrome by default. You can select a different browser in the Cypress GUI, or simply pass an argument in headless mode:

```
npx cypress run --headless --browser firefox
```

During CI the tests will run against both Electron (a lightweight version of Chrome) and Firefox.

## Using test fixtures and intercepts

You can test edge cases by adding custom fixture data along with api intercepts. This will allow the tests to run even in the absence of the backend api.
