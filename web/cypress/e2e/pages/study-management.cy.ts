beforeEach(() => {
  cy.clearCookies();
  cy.clearLocalStorage();
});

describe("Study Management Workflow", () => {
  beforeEach(() => {
    cy.loginAsBase();
    cy.mockAuthAsBaseStaffApprovedResearcher();
    cy.mockStudiesWithNewStudy();
    cy.mockStudyAccess();
    cy.mockStudyAgreementText();
  });

  it("should display study agreement form when agreement not confirmed", () => {
    cy.mockStudyAgreementsEmpty();
    cy.mockInformationAssetsEmpty();

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
    cy.mockInformationAssetsEmpty();

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
    cy.mockInformationAssetsWithSample();

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

describe("Information Assets Management", () => {
  beforeEach(() => {
    cy.loginAsBase();
    cy.mockAuthAsBaseStaffApprovedResearcher();
    cy.mockStudiesWithNewStudy();
    cy.mockStudyAccess();
    cy.mockStudyAgreementText();
    cy.mockStudyAgreementsConfirmed(); // Assume agreement already completed for asset tests
  });

  it("should display asset creation button when no assets exist", () => {
    cy.mockInformationAssetsEmpty();

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
    cy.mockInformationAssetsWithSample();

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
    cy.mockInformationAssetsEmpty();
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
    cy.get("select[name='legal_basis']").select("consent");
    cy.get("select[name='format']").select("electronic");
    cy.get("input[name='expires_at']").type("2025-12-31");

    // Select at least one location
    cy.get("input[type='checkbox'][value='arc_tre']").check();

    // Fill in boolean fields
    cy.get("input[name='requires_contract'][value='true']").check({ force: true });
    cy.get("input[name='has_dspt'][value='false']").check({ force: true });
    cy.get("input[name='stored_outside_uk_eea'][value='false']").check({ force: true });

    cy.get("select[name='status']").select("active");

    // Submit the form
    cy.get("button[type='submit']").click();

    cy.waitForAssetCreation();

    cy.visit("/studies/manage?studyId=123456789");

    cy.mockInformationAssetsWithSample();
    cy.wait("@getAssetsWithSample");
    cy.contains("Sample Asset Title 1").should("be.visible");
    cy.contains("requires a contract").should("be.visible");
  });
});

describe("Study Updates", () => {
  beforeEach(() => {
    cy.mockAuthAsStudyOwner();

    cy.mockStudiesWithNewStudy();
    cy.mockStudyAccess();
    cy.mockStudyAgreementText();
    cy.mockStudyAgreementsConfirmed();
    cy.mockAssetCreation();
    cy.mockInformationAssetsWithSample();
    cy.mockContractsWithSample();

    cy.visit("/studies/manage?studyId=123456789");
    cy.waitForAuth();
    cy.wait("@getStudyById");
    cy.wait("@getStudyAgreementText");
    cy.wait("@getStudyAgreementsConfirmed");
    cy.wait("@getAssetsWithSample");
    cy.wait("@getContractsWithSample");
  });

  it("should successfully update a study as its owner", () => {
    cy.mockStudyUpdate();
    cy.contains("My New Test Study").should("be.visible");
    cy.contains("Manage Study").click();

    cy.contains("Risk Score").should("be.visible");
    cy.contains("Additional Information").should("be.visible");
    cy.contains("Mark Ready for Review").should("be.visible");
    cy.contains("Edit Study").click();

    // edit the description and submit
    cy.get("textarea#description").type("My New Test Study Description");
    cy.get("[data-cy='next']").click();
    cy.get("[data-cy='next']").click();

    cy.get("button[type='submit']").click();

    cy.wait("@updateStudy");
  });
});
