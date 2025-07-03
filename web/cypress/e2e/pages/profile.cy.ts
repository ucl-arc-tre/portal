beforeEach(() => {
  cy.clearCookies();
  cy.clearLocalStorage();
});

describe(`Profile Page Step Workflow UI`, () => {
  beforeEach(() => {
    cy.loginAsBase();
  });

  it("displays step progress indicator with step 1 current", () => {
    cy.mockProfileChosenName(); // No chosen name
    cy.mockProfileAgreements(false); // No agreements
    cy.mockProfileTraining(false); // No training

    cy.visit("/profile");
    cy.waitForProfileData();

    cy.get("[aria-label='Profile setup progress']").should("be.visible");

    // Should show 3 steps
    cy.get("[aria-label='Profile setup progress'] li").should("have.length", 3);

    // Step titles should be visible
    cy.contains("Set Your Chosen Name").should("be.visible");
    cy.contains("Approved Researcher Agreement").should("be.visible");
    cy.contains("Training Certificate").should("be.visible");
  });

  it("only shows current step content", () => {
    cy.mockProfileChosenName(); // No chosen name
    cy.mockProfileAgreements(false); // No agreements
    cy.mockProfileTraining(false); // No training

    cy.visit("/profile");
    cy.waitForProfileData();

    // Should only show chosen name form initially
    cy.get("[data-cy='chosen-name-form']").should("be.visible");
    cy.get("[data-cy='approved-researcher-agreement']").should("not.exist");
    cy.get("[data-cy='training-certificate']").should("not.exist");
  });

  it("validates chosen name input", () => {
    cy.mockProfileChosenName(); // No chosen name
    cy.mockProfileAgreements(false); // No agreements
    cy.mockProfileTraining(false); // No training

    cy.visit("/profile");
    cy.waitForProfileData();

    cy.get("[data-cy='chosen-name-form'] input").type("123");
    cy.get("[data-cy='chosen-name-form'] button[type='submit']").click();

    cy.contains("Please enter a valid name").should("be.visible");

    // Should still be on step 1
    cy.get("[data-cy='chosen-name-form']").should("be.visible");
  });

  it("shows step 2 when chosen name is completed", () => {
    // Mock auth without approved-researcher role
    cy.mockAuthAsBaseUser();
    cy.waitForAuth();

    cy.mockProfileChosenName("Test User"); // Has chosen name
    cy.mockProfileAgreements(false); // No agreements yet
    cy.mockProfileTraining(false); // No training yet

    cy.visit("/profile");
    cy.waitForProfileData();

    // Should show step 2 content
    cy.get("[data-cy='approved-researcher-agreement']").should("be.visible");
    cy.get("[data-cy='chosen-name-form']").should("not.exist");
  });

  it("shows step 3 when chosen name and agreement completed", () => {
    // Mock auth without approved-researcher role
    cy.mockAuthAsBaseUser();

    cy.mockProfileChosenName("Test User"); // Has chosen name
    cy.mockProfileAgreements(true); // Agreement completed
    cy.mockProfileTraining(false); // Training not complete (this is why we should see step 3)

    cy.visit("/profile");
    cy.waitForAuth();
    cy.waitForProfileData();

    // Should show step 3 content
    cy.get("[data-cy='training-certificate']").should("be.visible");
    cy.get("[data-cy='approved-researcher-agreement']").should("not.exist");
    cy.get("[data-cy='chosen-name-form']").should("not.exist");
  });

  it("shows error message when invalid certificate uploaded", () => {
    // Mock auth without approved-researcher role
    cy.mockAuthAsBaseUser();

    // Mock profile with chosen name
    cy.mockProfileChosenName("Test User");

    // Mock agreements with approved-researcher agreement confirmed
    cy.mockProfileAgreements(true);

    // Mock training as not complete
    cy.mockProfileTraining(false);

    cy.visit("/profile");
    cy.waitForAuth();
    cy.waitForProfileData();

    // Should be on step 3
    cy.get("[data-cy='training-certificate']").should("be.visible");

    // Upload invalid certificate
    cy.get("input[type=file]").selectFile("cypress/fixtures/invalid_nhsd_certificate.pdf");
    cy.get("[data-cy='training-certificate-sumbit']").click();

    // Should show error message
    cy.contains("Certificate was not valid").should("be.visible");
  });

  it("shows an error message when the wrong name is used for the certificate", () => {
    // Mock auth without approved-researcher role initially
    cy.mockAuthAsBaseUser();

    // Mock agreements with approved-researcher agreement confirmed
    cy.mockProfileAgreements(true);

    // Mock training as not complete initially
    cy.mockProfileTraining(false);

    cy.visit("/profile");
    cy.waitForAuth();
    cy.waitForAgreements();
    cy.waitForTraining();

    cy.clearChosenName();
    cy.visit("/profile");

    // Step 1: Set chosen name to match certificate (Tom Young)
    cy.get("[data-cy='chosen-name-form'] input").type("Test Name");
    cy.get("[data-cy='chosen-name-form'] button[type='submit']").click();

    // Should be on step 3
    cy.get("[data-cy='training-certificate']").should("be.visible");

    // Upload valid certificate (matches "Tom Young")
    cy.get("input[type=file]").selectFile("cypress/fixtures/valid_nhsd_certificate.pdf");
    cy.get("[data-cy='training-certificate-sumbit']").click();

    // Should show error message
    cy.contains("Certificate was not valid. Name 'Tom Young' does not match 'Test Name'.").should("be.visible");
  });

  it("shows success message when valid certificate uploaded", () => {
    // Mock auth without approved-researcher role initially
    cy.mockAuthAsBaseUser();

    // Mock agreements with approved-researcher agreement confirmed
    cy.mockProfileAgreements(true);

    // Mock training as not complete initially
    cy.mockProfileTraining(false);

    cy.visit("/profile");
    cy.waitForAuth();
    cy.waitForAgreements();
    cy.waitForTraining();

    cy.clearChosenName();
    cy.visit("/profile");

    // Step 1: Set chosen name to match certificate (Tom Young)
    cy.get("[data-cy='chosen-name-form'] input").type("Tom Young");
    cy.get("[data-cy='chosen-name-form'] button[type='submit']").click();

    // Should be on step 3
    cy.get("[data-cy='training-certificate']").should("be.visible");

    // Upload valid certificate (matches "Tom Young")
    cy.get("input[type=file]").selectFile("cypress/fixtures/valid_nhsd_certificate.pdf");
    cy.get("[data-cy='training-certificate-sumbit']").click();

    cy.contains("Profile Complete").should("be.visible");
  });

  it("shows completion state when all steps done", () => {
    // Mock auth as approved researcher (complete profile)
    cy.mockAuthAsBaseApprovedResearcher();

    cy.mockProfileChosenName("Complete User"); // Has chosen name
    cy.mockProfileAgreements(true); // Agreement completed
    cy.mockProfileTraining(true, "2024-01-01T00:00:00Z"); // Training completed

    cy.visit("/profile");
    cy.waitForAuth();
    cy.waitForProfileData();

    // Should show completion message instead of steps
    cy.contains("Profile Complete").should("be.visible");
    cy.get("[data-cy='chosen-name-form']").should("not.exist");
    cy.get("[data-cy='approved-researcher-agreement']").should("not.exist");
    cy.get("[data-cy='training-certificate']").should("not.exist");
  });
});
