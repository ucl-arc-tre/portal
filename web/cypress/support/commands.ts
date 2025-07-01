/// <reference types="cypress" />

import { login } from "./auth";

const botAdminUsername = Cypress.env("botAdminUsername") as string;
const botAdminPassword = Cypress.env("botAdminPassword") as string;
export const botBaseUsername = Cypress.env("botBaseUsername") as string;
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

      /**
       * Mock auth response to return base user role only
       * @example cy.mockAuthAsBaseUser()
       */
      mockAuthAsBaseUser(): Chainable<any>;

      /**
       * Mock auth response to return base and approved researcher roles
       * @example cy.mockAuthAsBaseApprovedResearcher()
       */
      mockAuthAsBaseApprovedResearcher(): Chainable<any>;

      /**
       * Wait for the mocked auth request to complete
       * @example cy.waitForMockedAuth()
       */
      waitForMockedAuth(): Chainable<any>;

      /**
       * Force light mode for testing
       * @example cy.forceLightMode()
       */
      forceLightMode(): Chainable<any>;

      /**
       * Force dark mode for testing
       * @example cy.forceDarkMode()
       */
      forceDarkMode(): Chainable<any>;

      /**
       * Run accessibility check with axe-core (injects axe and checks for critical/serious violations)
       * @param selector - Optional selector to check specific element (defaults to entire page)
       * @example cy.checkAccessibility()
       * @example cy.checkAccessibility('[data-cy="profile-form"]')
       */
      checkAccessibility(selector?: string): Chainable<any>;

      /**
       * Mock profile chosen name endpoint
       * @param chosenName - The chosen name to return, empty string for no name, undefined for empty response
       * @example cy.mockProfileChosenName("Test User")
       * @example cy.mockProfileChosenName("") // no chosen name set
       */
      mockProfileChosenName(chosenName?: string): Chainable<any>;

      /**
       * Mock profile agreements endpoint
       * @param hasApprovedResearcher - Whether user has confirmed approved researcher agreement
       * @example cy.mockProfileAgreements(true)
       * @example cy.mockProfileAgreements(false)
       */
      mockProfileAgreements(hasApprovedResearcher: boolean): Chainable<any>;

      /**
       * Mock profile training endpoint
       * @param isValid - Whether the NHSD training is valid
       * @param completedAt - Optional completion date (only used if isValid is true)
       * @example cy.mockProfileTraining(false)
       * @example cy.mockProfileTraining(true, "2024-01-01T00:00:00Z")
       */
      mockProfileTraining(isValid: boolean, completedAt?: string): Chainable<any>;
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

Cypress.Commands.add("mockAuthAsBaseUser", () => {
  cy.intercept("GET", "/api/v0/auth", {
    fixture: "auth-base-user.json",
  }).as("authRequest");
});

Cypress.Commands.add("mockAuthAsBaseApprovedResearcher", () => {
  cy.intercept("GET", "/api/v0/auth", {
    fixture: "auth-base-approved-researcher.json",
  }).as("authRequest");
});

Cypress.Commands.add("waitForMockedAuth", () => {
  cy.wait("@authRequest");
});

Cypress.Commands.add("forceLightMode", () => {
  cy.wrap(
    Cypress.automation("remote:debugger:protocol", {
      command: "Emulation.setEmulatedMedia",
      params: {
        media: "screen",
        features: [
          {
            name: "prefers-color-scheme",
            value: "light",
          },
        ],
      },
    })
  );
});

Cypress.Commands.add("forceDarkMode", () => {
  cy.wrap(
    Cypress.automation("remote:debugger:protocol", {
      command: "Emulation.setEmulatedMedia",
      params: {
        media: "screen",
        features: [
          {
            name: "prefers-color-scheme",
            value: "dark",
          },
        ],
      },
    })
  );
});

Cypress.Commands.add("checkAccessibility", (selector?: string) => {
  cy.injectAxe();
  cy.checkA11y(selector, {
    includedImpacts: ["critical", "serious"],
  });
});

Cypress.Commands.add("mockProfileChosenName", (chosenName?: string) => {
  const body = chosenName === undefined ? {} : { chosen_name: chosenName };
  cy.intercept("GET", "/api/v0/profile", {
    statusCode: 200,
    body,
  }).as("getProfile");
});

Cypress.Commands.add("mockProfileAgreements", (hasApprovedResearcher: boolean) => {
  const confirmedAgreements = hasApprovedResearcher
    ? [
        {
          agreement_type: "approved-researcher",
          confirmed_at: "2024-01-01T00:00:00Z",
        },
      ]
    : [];

  cy.intercept("GET", "/api/v0/profile/agreements", {
    statusCode: 200,
    body: {
      confirmed_agreements: confirmedAgreements,
    },
  }).as("getAgreements");
});

Cypress.Commands.add("mockProfileTraining", (isValid: boolean, completedAt?: string) => {
  const trainingRecord: any = {
    kind: "training_kind_nhsd",
    is_valid: isValid,
  };

  if (isValid && completedAt) {
    trainingRecord.completed_at = completedAt;
  }

  cy.intercept("GET", "/api/v0/profile/training", {
    statusCode: 200,
    body: {
      training_records: [trainingRecord],
    },
  }).as("getTraining");
});
