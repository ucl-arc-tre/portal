/// <reference types="cypress" />

import { login } from "./auth";

const botAdminUsername = Cypress.env("botAdminUsername") as string;
const botAdminPassword = Cypress.env("botAdminPassword") as string;
export const botBaseUsername = Cypress.env("botBaseUsername") as string;
const botBasePassword = Cypress.env("botBasePassword") as string;
const botStaffUsername = Cypress.env("botStaffUsername") as string;
const botStaffPassword = Cypress.env("botStaffPassword") as string;

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
       * Custom command to login as as as staff user
       * @example cy.loginAsStaff()
       */
      loginAsStaff(): Chainable<JQuery<HTMLElement>>;

      /**
       * Clears the chosen name
       * @example cy.clearChosenName()
       */
      clearChosenName(chosenName?: string): Chainable<any>;

      // Auth fixture commands
      /**
       * Mock auth response to return base user role only
       * @example cy.mockAuthAsBaseUser()
       */
      mockAuthAsBaseUser(): Chainable<any>;

      /**
       * Mock auth response to return base and admin roles
       * @example cy.mockAuthAsBaseAdmin()
       */
      mockAuthAsAdminBase(): Chainable<any>;

      /**
       * Mock auth response to return base and approved researcher roles
       * @example cy.mockAuthAsBaseStaffApprovedResearcher()
       */
      mockAuthAsBaseStaffApprovedResearcher(): Chainable<any>;

      /**
       * Mock auth response to return admin and approved researcher roles
       * @example cy.mockAuthAsAdminApprovedResearcher()
       */
      mockAuthAsAdminApprovedResearcher(): Chainable<any>;

      /**
       * Mock auth response to return base and approved researcher roles with staff status
       * @example cy.mockAuthAsBaseNonStaffApprovedResearcher()
       */
      mockAuthAsBaseNonStaffApprovedResearcher(): Chainable<any>;

      /**
       * Mock auth response to return base and information asset owner roles with staff status
       * @example cy.mockAuthAsBaseInformationAssetOwner()
       */
      mockAuthAsBaseInformationAssetOwner(): Chainable<any>;

      /**
       * Mock auth response to return all roles required for study ownership
       * @example cy.mockAuthAsStudyOwner()
       */
      mockAuthAsStudyOwner(): Chainable<any>;

      /**
       * Mock auth response to return tre-ops-staff role without staff status
       * @example cy.mockAuthAsBaseInformationAssetOwner()
       */
      mockAuthAsTreOpsStaff(): Chainable<any>;

      // Profile fixture commands
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

      /**
       * Mock inviting external user
       * @param email - The email address to invite
       * @example cy.mockInviteExternalResearcher("hello@example.com")
       */
      mockInviteExternalResearcher(email: string): Chainable<any>;

      /**
       * Mock studies list to be empty
       * @example cy.mockStudiesEmpty()
       */
      mockStudiesEmpty(): Chainable<any>;

      /**
       * Mock studies list with a new study
       * @example cy.mockStudiesWithNewStudy()
       */
      mockStudiesWithNewStudy(): Chainable<any>;

      /**
       * Mock individual study access for testing
       * @example cy.mockStudyAccess()
       */
      mockStudyAccess(): Chainable<any>;

      /**
       * Mock individual asset access for testing
       * @example cy.mockAssetAccess()
       */
      mockAssetAccess(): Chainable<any>;

      /**
       * Mock successful study creation
       * @example cy.mockStudyCreation()
       */
      mockStudyCreation(): Chainable<any>;

      /**
       * Mock successful study update
       * @example cy.mockStudyUpdate()
       */
      mockStudyUpdate(): Chainable<any>;

      // Wait commands for fixtures
      /**
       * Wait for the mocked auth request to complete
       * @example cy.waitForAuth()
       */
      waitForAuth(): Chainable<any>;

      /**
       * Wait for the mocked chosen name request to complete
       * @example cy.waitForChosenName()
       */
      waitForChosenName(): Chainable<any>;

      /**
       * Wait for the mocked profile agreements request to complete
       * @example cy.waitForAgreements()
       */
      waitForAgreements(): Chainable<any>;

      /**
       * Wait for the mocked profile training request to complete
       * @example cy.waitForTraining()
       */
      waitForTraining(): Chainable<any>;

      /**
       * Wait for all profile-related requests to complete
       * @example cy.waitForProfileData()
       */
      waitForProfileData(): Chainable<any>;

      /**
       * Wait for the mocked studies request to complete
       * @example cy.waitForStudies()
       */
      waitForStudies(): Chainable<any>;

      /**
       * Wait for the mocked study creation request to complete
       * @example cy.waitForStudyCreation()
       */
      waitForStudyCreation(): Chainable<any>;

      /**
       * Mock empty assets list for a study
       * @example cy.mockInformationAssetsEmpty()
       */
      mockInformationAssetsEmpty(): Chainable<any>;

      /**
       * Mock assets list with sample assets
       * @example cy.mockInformationAssetsWithSample()
       */
      mockInformationAssetsWithSample(): Chainable<any>;

      /**
       * Mock successful asset creation
       * @example cy.mockAssetCreation()
       */
      mockAssetCreation(): Chainable<any>;

      /**
       * Wait for the mocked assets request to complete
       * @example cy.waitForAssets()
       */
      waitForAssets(): Chainable<any>;

      /**
       * Wait for the mocked asset creation request to complete
       * @example cy.waitForAssetCreation()
       */
      waitForAssetCreation(): Chainable<any>;

      /**
       * Mock study agreement text
       * @example cy.mockStudyAgreementText()
       */
      mockStudyAgreementText(): Chainable<any>;

      /**
       * Mock empty study agreements for user
       * @example cy.mockStudyAgreementsEmpty()
       */
      mockStudyAgreementsEmpty(): Chainable<any>;

      /**
       * Mock confirmed study agreements for user
       * @example cy.mockStudyAgreementsConfirmed()
       */
      mockStudyAgreementsConfirmed(): Chainable<any>;

      /**
       * Mock successful study agreement confirmation
       * @example cy.mockStudyAgreementConfirmation()
       */
      mockStudyAgreementConfirmation(): Chainable<any>;

      /**
       * Mock empty contracts list for an asset
       * @example cy.mockContractsEmpty()
       */
      mockContractsEmpty(): Chainable<any>;

      /**
       * Mock contracts list with sample contracts
       * @example cy.mockContractsWithSample()
       */
      mockContractsWithSample(): Chainable<any>;

      /**
       * Mock successful contract upload
       * @example cy.mockContractUpload()
       */
      mockContractUpload(): Chainable<any>;

      /**
       * Mock contract download
       * @example cy.mockContractDownload()
       */
      mockContractDownload(): Chainable<any>;

      /**
       * Mock contract edit
       * @example cy.mockContractEdit()
       */
      mockContractEdit(): Chainable<any>;

      /**
       * Run accessibility check with axe-core (injects axe and checks for critical/serious violations)
       * @param selector - Optional selector to check specific element (defaults to entire page)
       * @example cy.checkAccessibility()
       * @example cy.checkAccessibility('[data-cy="profile-form"]')
       */
      checkAccessibility(selector?: string): Chainable<any>;
    }
  }
}

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
  });
});

Cypress.Commands.add("loginAsStaff", () => {
  cy.session(`login-staff`, () => {
    const log = Cypress.log({
      displayName: "Entra ID staff user Login",
      message: [`🔐 Authenticating staff user`],
      autoEnd: false,
    });

    log.snapshot("before");
    login(botStaffUsername, botStaffPassword);
    log.snapshot("after");
    log.end();
  });
});

Cypress.Commands.add("clearChosenName", () => {
  cy.request({
    method: "POST",
    url: "/web/api/v0/profile",
    body: {
      chosen_name: "",
    },
  });
});

// Auth fixture commands
Cypress.Commands.add("mockAuthAsBaseUser", () => {
  cy.intercept("GET", "/web/api/v0/auth", {
    fixture: "auth-base-user.json",
  }).as("getAuth");
});

Cypress.Commands.add("mockAuthAsBaseStaffApprovedResearcher", () => {
  cy.intercept("GET", "/web/api/v0/auth", {
    fixture: "auth-base-staff-approved-researcher.json",
  }).as("getAuth");
});

Cypress.Commands.add("mockAuthAsAdminBase", () => {
  cy.intercept("GET", "/web/api/v0/auth", {
    fixture: "auth-admin-base.json",
  }).as("getAuth");
});

Cypress.Commands.add("mockAuthAsAdminApprovedResearcher", () => {
  cy.intercept("GET", "/web/api/v0/auth", {
    fixture: "auth-admin-approved-researcher.json",
  }).as("getAuth");
});

Cypress.Commands.add("mockAuthAsBaseNonStaffApprovedResearcher", () => {
  cy.intercept("GET", "/web/api/v0/auth", {
    fixture: "auth-base-non-staff-approved-researcher.json",
  }).as("getAuth");
});

Cypress.Commands.add("mockAuthAsBaseInformationAssetOwner", () => {
  cy.intercept("GET", "/web/api/v0/auth", {
    fixture: "auth-base-information-asset-owner.json",
  }).as("getAuth");
});

Cypress.Commands.add("mockAuthAsStudyOwner", () => {
  cy.intercept("GET", "/web/api/v0/auth", {
    fixture: "auth-study-owner.json",
  }).as("getAuth");
});

Cypress.Commands.add("mockAuthAsTreOpsStaff", () => {
  cy.intercept("GET", "/web/api/v0/auth", {
    fixture: "auth-tre-ops-staff.json",
  }).as("getAuth");
});

Cypress.Commands.add("mockProfileChosenName", (chosenName?: string) => {
  const body = chosenName === undefined ? {} : { chosen_name: chosenName };
  cy.intercept("GET", "/web/api/v0/profile", {
    statusCode: 200,
    body,
  }).as("getChosenName");
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

  cy.intercept("GET", "/web/api/v0/profile/agreements", {
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

  cy.intercept("GET", "/web/api/v0/profile/training", {
    statusCode: 200,
    body: {
      training_records: [trainingRecord],
    },
  }).as("getTraining");
});

Cypress.Commands.add("mockInviteExternalResearcher", (email: string) => {
  const body = { email: email };
  cy.intercept("POST", "/web/api/v0/users/invite", {
    statusCode: 204,
    body,
  }).as("postUserIvite");
});

Cypress.Commands.add("checkAccessibility", (selector?: string) => {
  cy.injectAxe();
  cy.checkA11y(selector, {
    includedImpacts: ["critical", "serious"],
  });
});

// Wait commands for fixtures
Cypress.Commands.add("waitForAuth", () => {
  cy.wait("@getAuth");
});

Cypress.Commands.add("waitForChosenName", () => {
  cy.wait("@getChosenName");
});

Cypress.Commands.add("waitForAgreements", () => {
  cy.wait("@getAgreements");
});

Cypress.Commands.add("waitForTraining", () => {
  cy.wait("@getTraining");
});

Cypress.Commands.add("waitForProfileData", () => {
  cy.wait("@getChosenName");
  cy.wait("@getAgreements");
  cy.wait("@getTraining");
});

// Studies fixture commands
Cypress.Commands.add("mockStudiesEmpty", () => {
  cy.intercept("GET", "/web/api/v0/studies", {
    fixture: "studies-empty.json",
  }).as("getStudiesEmpty");
});

Cypress.Commands.add("mockStudiesWithNewStudy", () => {
  cy.intercept("GET", "/web/api/v0/studies", {
    fixture: "studies-with-new-study.json",
  }).as("getStudiesWithNew");
});

Cypress.Commands.add("mockStudyAccess", () => {
  cy.intercept("GET", "/web/api/v0/studies/123456789", {
    body: {
      id: "123456789",
      title: "My New Test Study",
      description: null,
      owner_user_id: "123456789",
      owner_username: "testuser",
      additional_study_admin_usernames: [],
      data_controller_organisation: "UCL",
      approval_status: "Incomplete",
      created_at: "2024-01-01T10:00:00Z",
      updated_at: "2024-01-01T10:00:00Z",
    },
  }).as("getStudyById");
});

Cypress.Commands.add("mockAssetAccess", () => {
  cy.intercept("GET", "/web/api/v0/studies/123456789/assets/asset-123", {
    body: {
      id: "asset-123",
      creator_user_id: "user-123",
      study_id: "123456789",
      title: "Sample Asset Title 1",
      description: "Sample Asset Description 1",
      classification_impact: "confidential",
      protection: "pseudonymisation",
      legal_basis: "consent",
      format: "electronic",
      expires_at: "2025-12-31",
      locations: ["ucl_rcs", "ucl_data_safe_haven"],
      requires_contract: true,
      has_dspt: true,
      stored_outside_uk_eea: false,
      status: "active",
      created_at: "2024-01-01T10:00:00Z",
      updated_at: "2024-01-01T10:00:00Z",
    },
  }).as("getAssetById");
});

Cypress.Commands.add("mockStudyCreation", () => {
  cy.intercept("POST", "/web/api/v0/studies", {
    statusCode: 201,
  }).as("createStudy");
});

Cypress.Commands.add("mockStudyUpdate", () => {
  cy.intercept("PUT", "/web/api/v0/studies/*", {
    statusCode: 200,
  }).as("updateStudy");
});

// Wait commands for studies
Cypress.Commands.add("waitForStudies", () => {
  cy.wait(["@getStudiesEmpty", "@getStudiesWithNew"]);
});

Cypress.Commands.add("waitForStudyCreation", () => {
  cy.wait("@createStudy");
});

// Asset fixture commands
Cypress.Commands.add("mockInformationAssetsEmpty", () => {
  cy.intercept("GET", "/web/api/v0/studies/*/assets", {
    fixture: "assets-empty.json",
  }).as("getAssetsEmpty");
});

Cypress.Commands.add("mockInformationAssetsWithSample", () => {
  cy.intercept("GET", "/web/api/v0/studies/*/assets", {
    fixture: "assets-with-sample.json",
  }).as("getAssetsWithSample");
});

Cypress.Commands.add("mockAssetCreation", () => {
  cy.intercept("POST", "/web/api/v0/studies/*/assets", {
    statusCode: 201,
  }).as("createAsset");
});

// Wait commands for assets
Cypress.Commands.add("waitForAssets", () => {
  cy.wait(["@getAssetsEmpty", "@getAssetsWithSample"]);
});

Cypress.Commands.add("waitForAssetCreation", () => {
  cy.wait("@createAsset");
});

// Study agreement fixture commands
Cypress.Commands.add("mockStudyAgreementText", () => {
  cy.intercept("GET", "/web/api/v0/agreements/study-owner", {
    fixture: "study-agreement-text.json",
  }).as("getStudyAgreementText");
});

Cypress.Commands.add("mockStudyAgreementsEmpty", () => {
  cy.intercept("GET", "/web/api/v0/studies/*/agreements", {
    fixture: "study-agreements-empty.json",
  }).as("getStudyAgreementsEmpty");
});

Cypress.Commands.add("mockStudyAgreementsConfirmed", () => {
  cy.intercept("GET", "/web/api/v0/studies/*/agreements", {
    fixture: "study-agreements-confirmed.json",
  }).as("getStudyAgreementsConfirmed");
});

Cypress.Commands.add("mockStudyAgreementConfirmation", () => {
  cy.intercept("POST", "/web/api/v0/studies/*/agreements", {
    statusCode: 200,
  }).as("confirmStudyAgreement");
});

Cypress.Commands.add("mockContractsEmpty", () => {
  cy.intercept("GET", "/web/api/v0/studies/*/assets/*/contracts", {
    fixture: "contracts-empty.json",
  }).as("getContractsEmpty");
});

Cypress.Commands.add("mockContractsWithSample", () => {
  cy.intercept("GET", "/web/api/v0/studies/*/assets/*/contracts", {
    fixture: "contracts-with-sample.json",
  }).as("getContractsWithSample");
});

Cypress.Commands.add("mockContractUpload", () => {
  cy.intercept("POST", "/web/api/v0/studies/*/assets/*/contracts/upload", {
    statusCode: 204,
  }).as("uploadContract");
});

Cypress.Commands.add("mockContractDownload", () => {
  cy.intercept("GET", "/web/api/v0/studies/*/assets/*/contracts/*/download", {
    fixture: "valid_nhsd_certificate.pdf", // mocking with an available sample PDF for now, can add a sample contract PDF later
  }).as("downloadContract");
});

Cypress.Commands.add("mockContractEdit", () => {
  cy.intercept("PUT", "/web/api/v0/studies/*/assets/*/contracts/*", {
    statusCode: 204,
  }).as("editContract");
});
