beforeEach(() => {
  cy.clearCookies();
  cy.clearLocalStorage();
});

describe("Step-based Profile Onboarding Integration", () => {
  it("admin user completes full profile setup workflow", () => {
    cy.loginAsAdmin();
    cy.clearChosenName();
    cy.visit("/profile");

    cy.contains("Loading...").should("not.exist");

    // Step 1: Set chosen name
    cy.get("[data-cy='chosen-name-form']").should("be.visible");
    cy.get("[data-cy='chosen-name-form'] input").type("Admin Test User");
    cy.get("[data-cy='chosen-name-form'] button[type='submit']").click();

    // Step 2: Agreement should now be visible
    cy.get("[data-cy='approved-researcher-agreement']").should("be.visible");
    cy.get("input[name='agreed'][type='checkbox']").check();
    cy.get("[data-cy='approved-researcher-agreement-agree']").click();

    // Step 3: Certificate upload should now be visible
    cy.get("[data-cy='training-certificate']").should("be.visible");

    // Verify progress indicators show completed steps
    cy.get("[aria-label='Profile setup progress']").should("contain", "✔");
  });

  it("base user can complete step-by-step profile setup", () => {
    cy.loginAsBase();
    cy.clearChosenName();
    cy.visit("/profile");

    cy.contains("Loading...").should("not.exist");

    // Step 1: Set chosen name
    cy.get("[data-cy='chosen-name-form']").should("be.visible");
    cy.get("[data-cy='chosen-name-form'] input").type("Base Test User");
    cy.get("[data-cy='chosen-name-form'] button[type='submit']").click();

    // Verify step progression
    cy.get("[data-cy='approved-researcher-agreement']").should("be.visible");

    // Complete agreement
    cy.get("input[name='agreed'][type='checkbox']").check();
    cy.get("[data-cy='approved-researcher-agreement-agree']").click();

    // Verify agreement completion
    cy.contains("Agreement confirmed").should("be.visible");
  });
});

describe("Profile Step Progress Integration", () => {
  beforeEach(() => {
    cy.loginAsBase();
    cy.clearChosenName();
    cy.visit("/profile");
  });

  const chosenName = (Cypress.env("chosenName") as string) || "Test Chosen Name";

  it("shows correct step progress indicators", () => {
    // Initially, step 1 should be current (red), others pending
    cy.get("[aria-label='Profile setup progress']").should("be.visible");

    // Complete step 1 - chosen name
    cy.get("[data-cy='chosen-name-form'] input").type(chosenName);
    cy.get("[data-cy='chosen-name-form'] button[type='submit']").click();

    // Step 1 should now show as completed with checkmark
    cy.get("[aria-label='Profile setup progress']").should("contain", "✔");

    // Step 2 should now be current
    cy.get("[data-cy='approved-researcher-agreement']").should("be.visible");
  });

  it("can navigate through all steps sequentially", () => {
    // Step 1: Chosen name
    cy.get("[data-cy='chosen-name-form']").should("be.visible");
    cy.get("[data-cy='chosen-name-form'] input").type(chosenName);
    cy.get("[data-cy='chosen-name-form'] button[type='submit']").click();

    // Step 2: Agreement
    cy.get("[data-cy='approved-researcher-agreement']").should("be.visible");
    cy.get("input[name='agreed'][type='checkbox']").check();
    cy.get("[data-cy='approved-researcher-agreement-agree']").click();

    // Step 3: Certificate upload
    cy.get("[data-cy='training-certificate']").should("be.visible");

    // Verify persistence on reload
    cy.reload();
    cy.get("[data-cy='training-certificate']").should("be.visible");
  });
});

describe("NHSD Training Certificate Upload Integration", () => {
  beforeEach(() => {
    cy.loginAsBase();
    cy.clearChosenName();
  });

  const completeStepsToUpload = function (name: string) {
    cy.visit("/profile");
    cy.contains("Loading...").should("not.exist");

    // Step 1: Set chosen name
    cy.get("[data-cy='chosen-name-form'] input").type(name);
    cy.get("[data-cy='chosen-name-form'] button[type='submit']").click();

    // Step 2: Complete agreement
    cy.get("[data-cy='approved-researcher-agreement']").should("be.visible");
    cy.get("input[name='agreed'][type='checkbox']").check();
    cy.get("[data-cy='approved-researcher-agreement-agree']").click();

    // Now should be on step 3 - certificate upload
    cy.get("[data-cy='training-certificate']").should("be.visible");
  };

  const submitFile = function (filePath: string) {
    cy.get("input[type=file]").selectFile(filePath);
    cy.get("[data-cy='training-certificate-sumbit']").click();
  };

  it("invalid certificate is not valid", function () {
    completeStepsToUpload("Tom Young");
    submitFile("cypress/fixtures/invalid_nhsd_certificate.pdf");
    cy.contains("Certificate was not valid").should("be.visible");
  });

  it("valid certificate for wrong user is invalid", function () {
    completeStepsToUpload("Bob smith");
    submitFile("cypress/fixtures/valid_nhsd_certificate.pdf");
    cy.contains("Certificate was not valid").should("be.visible");
  });

  it("valid certificate for correct user is valid", function () {
    completeStepsToUpload("Tom Young");
    submitFile("cypress/fixtures/valid_nhsd_certificate.pdf");
    cy.contains("Valid training").should("be.visible");

    // Check that profile completion is shown
    cy.get("[aria-label='Profile setup progress']").should("contain", "✔");

    // Navigate to homepage to verify approved researcher status
    cy.visit("/");
    cy.contains("approved-researcher").should("be.visible");
  });

  it("cannot access certificate upload without completing previous steps", function () {
    cy.visit("/profile");

    // Should not see certificate upload initially
    cy.get("[data-cy='training-certificate']").should("not.exist");

    // Should see chosen name form instead
    cy.get("[data-cy='chosen-name-form']").should("be.visible");
  });
});
