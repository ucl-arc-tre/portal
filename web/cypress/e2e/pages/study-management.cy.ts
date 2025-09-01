beforeEach(() => {
  cy.clearCookies();
  cy.clearLocalStorage();
});

describe("Study Management Workflow", () => {
  beforeEach(() => {
    cy.loginAsBase();
    cy.mockAuthAsBaseApprovedResearcher();
    cy.mockStudiesWithNewStudy();
    cy.mockStudyAccess();
    cy.mockStudyAgreementText();
  });

  it("should display study agreement form when agreement not confirmed", () => {
    cy.mockStudyAgreementsEmpty();
    cy.mockStudyAssetsEmpty();

    cy.visit("/studies/manage?studyId=123456789");
    cy.waitForAuth();
    cy.wait("@getStudyById");
    cy.wait("@getStudyAgreementText");
    cy.wait("@getStudyAgreementsEmpty");

    // Should show the study agreement form
    cy.contains("Study Owner Agreement").should("be.visible");
  });

  it("should complete agreement workflow and show asset creation", () => {
    cy.mockStudyAgreementsEmpty();
    cy.mockStudyAgreementConfirmation();
    cy.mockStudyAssetsEmpty();

    cy.visit("/studies/manage?studyId=123456789");
    cy.waitForAuth();
    cy.wait("@getStudyById");
    cy.wait("@getStudyAgreementText");
    cy.wait("@getStudyAgreementsEmpty");

    cy.get('[data-cy="agreement-agree"]').should("be.disabled");
    const buttonTimeoutSeconds = 120;
    cy.get('[data-cy="agreement-agree"]').click({ timeout: buttonTimeoutSeconds * 1000 });

    cy.wait("@confirmStudyAgreement");
    cy.wait("@getAssetsEmpty");

    // Should now show asset section
    cy.contains("No assets have been created for this study yet").should("be.visible");
    cy.contains("Add First Asset").should("be.visible");
  });

  it("should show assets section when agreement already confirmed", () => {
    cy.mockStudyAgreementsConfirmed();
    cy.mockStudyAssetsWithSample();

    cy.visit("/studies/manage?studyId=123456789");
    cy.waitForAuth();
    cy.wait("@getStudyById");
    cy.wait("@getStudyAgreementText");
    cy.wait("@getStudyAgreementsConfirmed");
    cy.wait("@getAssetsWithSample");

    // Should skip agreement and show assets directly
    cy.contains("Sample Asset Title 1").should("be.visible");
    cy.contains("Sample Asset Title 2").should("be.visible");
    cy.contains("Add Asset").should("be.visible");
  });
});

describe("Study Assets Management", () => {
  beforeEach(() => {
    cy.loginAsBase();
    cy.mockAuthAsBaseApprovedResearcher();
    cy.mockStudiesWithNewStudy();
    cy.mockStudyAccess();
    cy.mockStudyAgreementText();
    cy.mockStudyAgreementsConfirmed(); // Assume agreement already completed for asset tests
  });

  it("should display asset creation button when no assets exist", () => {
    cy.mockStudyAssetsEmpty();

    cy.visit("/studies/manage?studyId=123456789");
    cy.waitForAuth();
    cy.wait("@getStudyById");
    cy.wait("@getStudyAgreementText");
    cy.wait("@getStudyAgreementsConfirmed");
    cy.wait("@getAssetsEmpty");

    // Should show button to create first asset since no assets exist
    cy.contains("No assets have been created for this study yet").should("be.visible");
    cy.contains("Add First Asset").should("be.visible");
  });

  it("should display existing assets and allow creating additional ones", () => {
    cy.mockStudyAssetsWithSample();

    cy.visit("/studies/manage?studyId=123456789");
    cy.waitForAuth();
    cy.wait("@getStudyById");
    cy.wait("@getStudyAgreementText");
    cy.wait("@getStudyAgreementsConfirmed");
    cy.wait("@getAssetsWithSample");

    // Should display existing assets
    cy.contains("Sample Asset Title 1").should("be.visible");
    cy.contains("Sample Asset Title 2").should("be.visible");

    // Should show button to add another asset
    cy.contains("Add Asset").should("be.visible").click();

    // Asset creation modal should appear
    cy.get("[data-cy='create-asset-form']").should("be.visible");
  });

  it("should successfully create a new asset", () => {
    cy.mockStudyAssetsEmpty();
    cy.mockAssetCreation();

    cy.visit("/studies/manage?studyId=123456789");
    cy.waitForAuth();
    cy.wait("@getStudyById");
    cy.wait("@getStudyAgreementText");
    cy.wait("@getStudyAgreementsConfirmed");
    cy.wait("@getAssetsEmpty");

    // Click button to open asset creation form
    cy.contains("Add First Asset").click();

    // Fill in the asset creation form
    cy.get("input[name='title']").type("Test Asset Title");
    cy.get("textarea[name='description']").type("Test Asset Description");
    cy.get("select[name='classification_impact']").select("public");
    cy.get("select[name='protection']").select("anonymisation");
    cy.get("input[name='legal_basis']").type("test123");
    cy.get("select[name='format']").select("electronic");
    cy.get("input[name='expiry']").type("2025-12-31");

    // Select at least one location
    cy.get("input[type='checkbox'][value='arc_tre']").check();

    // Fill in boolean fields
    cy.get("input[name='has_dspt'][value='false']").check({ force: true });
    cy.get("input[name='stored_outside_uk_eea'][value='false']").check({ force: true });

    cy.get("select[name='status']").select("active");

    // Submit the form
    cy.get("button[type='submit']").click();

    cy.waitForAssetCreation();

    cy.visit("/studies/manage?studyId=123456789");

    cy.mockStudyAssetsWithSample();
    cy.wait("@getAssetsWithSample");
    cy.contains("Sample Asset Title 1").should("be.visible");
  });
});
