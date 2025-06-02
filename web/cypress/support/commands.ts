/// <reference types="cypress" />

import { login } from "./auth";

const botAdminUsername = Cypress.env("botAdminUsername") as string;
const botAdminPassword = Cypress.env("botAdminPassword") as string;
const botBaseUsername = Cypress.env("botBaseUsername") as string;
const botBasePassword = Cypress.env("botBasePassword") as string;

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      /**
       * Custom command to login as as admin
       * @example cy.loginAsAdmin()
       */
      loginAsAdmin(): Chainable<JQuery<HTMLElement>>;

      /**
       * Custom command to login as as as base user
       * @example cy.loginAsBase()
       */
      loginAsBase(): Chainable<JQuery<HTMLElement>>;

      /**
       * Repeatedly polls the given endpoint until it answers with a status
       * other than 502, 503, 504 —or until the retry limit is exceeded.
       * This is useful as the containerized API may take a while to start up
       *
       * @param retries  How many attempts to make (default = 5)
       * @param delay    Milliseconds to wait between attempts (default = 2000 ms)
       * @example cy.waitForApi()              // default settings
       * @example cy.waitForApi(10, 500)       // custom settings
       */
      waitForApi(retries?: number, delay?: number): Chainable<Cypress.Response<any>>;

      /**
       * Clears the chosen name
       * @example cy.clearChosenName()
       */
      clearChosenName(chosenName?: string): Chainable<any>;
    }
  }
}

Cypress.Commands.add("waitForApi", (retries: number = 5, delay: number = 2000) => {
  const tryRequest = (attemptsLeft: number): Cypress.Chainable<any> => {
    if (attemptsLeft === 0) {
      throw new Error(
        "API not available after multiple attempts. Your API Docker container may not be ready yet. Try again in 30 seconds"
      );
    }

    return cy
      .request({
        method: "GET",
        url: "/api/v0/profile",
        failOnStatusCode: false, // we want to allow 401's as we only care that the api is up
      })
      .then((res) => {
        if ([502, 503, 504].includes(res.status)) {
          cy.wait(delay);
          return tryRequest(attemptsLeft - 1);
        }
        return res; // API is up
      });
  };

  return tryRequest(retries);
});

Cypress.Commands.add("loginAsAdmin", () => {
  // See: https://docs.cypress.io/app/guides/authentication-testing/azure-active-directory-authentication
  cy.session(`login-admin`, () => {
    const log = Cypress.log({
      displayName: "Entra ID Admin Login",
      message: [`🔐 Authenticating admin`],
      autoEnd: false,
    });

    log.snapshot("before");
    login(botAdminUsername, botAdminPassword);

    log.snapshot("after");
    log.end();

    cy.waitForApi(); // poll until the backend API is available
  });
});

Cypress.Commands.add("loginAsBase", () => {
  cy.session(`login-base`, () => {
    const log = Cypress.log({
      displayName: "Entra ID Base user Login",
      message: [`🔐 Authenticating base user`],
      autoEnd: false,
    });

    log.snapshot("before");
    login(botBaseUsername, botBasePassword);
    log.snapshot("after");
    log.end();

    cy.waitForApi(); // poll until the backend API is available
  });
});

Cypress.Commands.add("clearChosenName", () => {
  cy.request({
    method: "POST",
    url: "/api/v0/profile",
    body: {
      chosen_name: "",
    },
  });
});
