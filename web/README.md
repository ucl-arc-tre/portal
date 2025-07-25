# ARC TRE portal frontent

This React + Typescript project was set up using [NextJS](https://nextjs.org).

Development files are located in '/src' with all components routed into the app folder, following conventions of [app routing](https://nextjs.org/docs/14/app/building-your-application/routing)

---

# Requirements

Make sure you have read through the root [`README.md`](../README.md) file. This will give you more background on the application architecture.

## Environment variables

This project checks in to git both the `.env.development` and `.env.production` files. Make sure not to include any sensitive information in either of the environment variable files. This is because the frontend is statically exported and so all environment variables will be publicly available. Please use environment variables for config setup that differs between development and production.

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

# Testing

This project uses [Cypress](https://www.cypress.io/) for end-to-end testing. For testing documentation, setup instructions, and test organization see the [Cypress README](./cypress/README.md).
