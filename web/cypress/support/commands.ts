/// <reference types="cypress" />

import { login } from "./auth";

const botAdminUsername = Cypress.env("botAdminUsername") as string;
const botAdminPassword = Cypress.env("botAdminPassword") as string;

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      /**
       * Custom command to login as as admin
       * @example cy.loginAsAdmin()
       */
      loginAsAdmin(): Chainable<JQuery<HTMLElement>>;
    }
  }
}

Cypress.Commands.add("loginAsAdmin", () => {
  // See: https://docs.cypress.io/app/guides/authentication-testing/azure-active-directory-authentication
  cy.session(`login-admin`, () => {
    const log = Cypress.log({
      displayName: "Entra ID Login",
      message: [`🔐 Authenticating admin`],
      autoEnd: false,
    });

    log.snapshot("before");
    login(botAdminUsername, botAdminPassword);
    log.snapshot("after");
    log.end();
  });
});
