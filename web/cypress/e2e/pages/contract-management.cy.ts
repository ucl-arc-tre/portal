beforeEach(() => {
  cy.clearCookies();
  cy.clearLocalStorage();
});

describe("Contract Management via Study", () => {
  beforeEach(() => {
    cy.loginAsBase();
    cy.mockAuthAsStudyOwner();
    cy.mockStudiesWithNewStudy();
    cy.mockStudyAccess();
    cy.mockAssetAccess();
    cy.mockStudyAgreementText();
    cy.mockStudyAgreementsConfirmed();
    cy.mockInformationAssetsWithSampleNoContracts();
  });

  it("should display contract management section for a study", () => {
    cy.mockStudyContractsEmpty();

    cy.visit("/studies/manage?studyId=123456789");
    cy.waitForAuth();

    //study should be valid from initial setup
    cy.wait(["@getStudyById"]);

    cy.wait("@getStudyAgreementText");
    cy.wait("@getStudyAgreementsConfirmed");
    cy.wait("@getAssetsWithSampleNoContracts");

    // Should show empty contract state
    cy.get('button[data-cy="contracts-tab"').should("be.visible").click();
    cy.contains("No contracts uploaded").should("be.visible");
    cy.contains("Add Contract").should("be.visible");
  });

  it("should successfully upload a contract", () => {
    cy.mockStudyContractsEmpty();
    cy.mockContractUpload();
    cy.mockStudyContractsWtihSample();

    cy.visit("/studies/manage?studyId=123456789");
    cy.waitForAuth();
    cy.wait("@getStudyById");
    cy.wait("@getStudyAgreementText");
    cy.wait("@getStudyAgreementsConfirmed");
    cy.get('button[data-cy="contracts-tab"').should("be.visible").click();

    // Open upload form
    cy.contains("Add Contract").click();

    // Fill in the form
    cy.get("input[name='organisationSignatory']").type("Test Organization");
    cy.get("input[name='thirdPartyName']").type("Test Third Party");
    cy.get("select[name='status']").select("proposed");
    cy.get("input[name='startDate']").type("2024-01-01");
    cy.get("input[name='expiryDate']").type("2025-12-31");

    // Simulate a pdf upload
    cy.fixture("valid_nhsd_certificate.pdf", "base64").then((fileContent) => {
      cy.get("input[type='file']").selectFile(
        {
          contents: Cypress.Buffer.from(fileContent, "base64"),
          fileName: "sample-contract.pdf",
          mimeType: "application/pdf",
        },
        { force: true }
      );
    });

    cy.get("button[type='submit']").click();

    cy.wait("@uploadContract");
    cy.wait("@getStudyContractsWithSample");

    // Verify the mock contract is displayed
    cy.contains("sample-contract.pdf").should("be.visible");
    cy.contains("Sample Organization").should("be.visible");
  });

  it("should allow downloading contracts", () => {
    cy.mockStudyContractsWtihSample();
    cy.mockContractDownload();

    cy.visit("/studies/manage?studyId=123456789");
    cy.waitForAuth();
    cy.wait("@getStudyById");
    cy.wait("@getStudyAgreementText");
    cy.wait("@getStudyAgreementsConfirmed");
    cy.contains("Contracts").should("be.visible").click();
    cy.wait("@getStudyContractsWithSample");

    // Verify contract is displayed
    cy.contains("sample-contract.pdf").should("be.visible");
    cy.contains("Active").should("be.visible");

    cy.contains("Download PDF").click();

    // Verify download request was made
    cy.wait("@downloadContract");
  });

  it("should prepopulate form fields when editing a contract", () => {
    cy.mockStudyContractsWtihSample();

    cy.visit("/studies/manage?studyId=123456789");
    cy.waitForAuth();
    cy.wait("@getStudyById");
    cy.wait("@getStudyAgreementText");
    cy.wait("@getStudyAgreementsConfirmed");
    cy.contains("Contracts").should("be.visible").click();
    cy.wait("@getStudyContractsWithSample");

    cy.contains("Edit").first().click();

    // Verify form is prepopulated with existing values
    cy.get("input[name='organisationSignatory']").should("have.value", "Sample Organization");
    cy.get("input[name='thirdPartyName']").should("have.value", "Sample Third Party");
    cy.get("select[name='status']").should("have.value", "active");
    cy.get("input[name='startDate']").should("have.value", "2024-01-01");
    cy.get("input[name='expiryDate']").should("have.value", "2025-12-31");

    // Verify the dialog title shows we're editing
    cy.contains("Edit Contract").should("be.visible");
    cy.contains("Current file: sample-contract.pdf").should("be.visible");
    cy.contains("Choose new PDF file (optional)").should("be.visible");
  });

  it("should successfully submit edited contract data", () => {
    cy.mockContractEdit();
    cy.mockStudyContractsWtihSample();

    cy.visit("/studies/manage?studyId=123456789");
    cy.waitForAuth();
    cy.wait("@getStudyById");
    cy.wait("@getStudyAgreementText");
    cy.wait("@getStudyAgreementsConfirmed");
    cy.contains("Contracts").should("be.visible").click();
    cy.wait("@getStudyContractsWithSample");

    cy.contains("Edit").first().click();

    // Modify a form field
    cy.get("select[name='status']").select("expired");

    // Submit the form
    cy.contains("Update Contract").click();

    cy.wait("@editContract");
    cy.wait("@getStudyContractsWithSample");

    // Verify the mock contract is displayed
    cy.contains("sample-contract.pdf").should("be.visible");
    cy.contains("Sample Organization").should("be.visible");
  });

  it("should successfully link to an asset", () => {
    cy.mockContractEdit();
    cy.mockStudyContractsWtihSample();

    cy.visit("/studies/manage?studyId=123456789");
    cy.waitForAuth();
    cy.wait("@getStudyById");
    cy.wait("@getStudyAgreementText");
    cy.wait("@getStudyAgreementsConfirmed");
    cy.contains("Contracts").should("be.visible").click();
    cy.wait("@getStudyContractsWithSample");

    cy.contains("Edit").first().click();

    // Modify a form field
    //TODO; get assets and then select
    cy.get("select[name='assetIds.0.value']").select("asset-467");

    // Submit the form
    cy.contains("Update Contract").click();

    cy.wait("@editContract");
    cy.wait("@getStudyContractsWithSample");

    // Verify the mock contract is displayed
    cy.contains("sample-contract.pdf").should("be.visible");
    cy.contains("Sample Organization").should("be.visible");
  });
});

describe("Contract Management via Asset", () => {
  beforeEach(() => {
    cy.loginAsBase();
    cy.mockAuthAsStudyOwner();
    cy.mockStudiesWithNewStudy();
    cy.mockStudyAccess();
    cy.mockAssetAccess();
    cy.mockStudyAgreementText();
    cy.mockStudyAgreementsConfirmed();
    cy.mockInformationAssetsWithSample();
  });

  it("should display contract management section for an asset", () => {
    cy.mockAssetContractsEmpty();

    cy.visit("/studies/manage?studyId=123456789");
    cy.waitForAuth();
    cy.wait("@getStudyById");
    cy.wait("@getStudyAgreementText");
    cy.wait("@getStudyAgreementsConfirmed");

    // Wait for contracts to load
    cy.wait("@getAssetContractsEmpty");

    cy.contains("This asset requires a contract that has not yet been added").should("be.visible");
    cy.contains("Manage Asset").click();

    // Should show empty contract state
    cy.contains("No contracts uploaded").should("be.visible");
    cy.contains("Add Contract").should("be.visible");
  });

  it("should display contract management section for an asset", () => {
    cy.mockAssetContractsEmpty();

    cy.visit("/studies/manage?studyId=123456789");
    cy.waitForAuth();
    cy.wait("@getStudyById");
    cy.wait("@getStudyAgreementText");
    cy.wait("@getStudyAgreementsConfirmed");
    cy.wait("@getAssetsWithSample");

    // Navigate to asset management page
    cy.contains("Sample Asset Title 1").should("be.visible");
    cy.contains("Manage Asset").click();

    // Wait for asset and contracts to load
    cy.wait("@getAssetById");
    cy.wait("@getAssetContractsEmpty");

    // Should show empty contract state
    cy.contains("No contracts uploaded").should("be.visible");
    cy.contains("Add Contract").should("be.visible");
  });

  it("should successfully upload a contract", () => {
    cy.mockAssetContractsEmpty();
    cy.mockContractUpload();
    cy.mockAssetContractsWtihSample();

    cy.visit("/studies/manage?studyId=123456789");
    cy.waitForAuth();
    cy.wait("@getStudyById");
    cy.wait("@getStudyAgreementText");
    cy.wait("@getStudyAgreementsConfirmed");

    // Navigate to asset contracts
    cy.get('button[data-cy="assets-tab"').should("be.visible").click();
    cy.wait("@getAssetsWithSample");
    cy.contains("Sample Asset Title").should("be.visible");
    cy.contains("Manage Asset").click();

    // Wait for asset and contracts to load
    cy.wait("@getAssetById");

    // Open upload form
    cy.contains("Add Contract").click();

    // Fill in the form
    cy.get("input[name='organisationSignatory']").type("Test Organization");
    cy.get("input[name='thirdPartyName']").type("Test Third Party");
    cy.get("select[name='status']").select("proposed");
    cy.get("input[name='startDate']").type("2024-01-01");
    cy.get("input[name='expiryDate']").type("2025-12-31");

    // Simulate a pdf upload
    cy.fixture("valid_nhsd_certificate.pdf", "base64").then((fileContent) => {
      cy.get("input[type='file']").selectFile(
        {
          contents: Cypress.Buffer.from(fileContent, "base64"),
          fileName: "sample-contract.pdf",
          mimeType: "application/pdf",
        },
        { force: true }
      );
    });

    cy.get("button[type='submit']").click();

    cy.wait("@uploadContract");
    cy.wait("@getAssetContractsWithSample");

    // Verify the mock contract is displayed
    cy.contains("sample-contract.pdf").should("be.visible");
    cy.contains("Sample Organization").should("be.visible");
  });

  it("should allow downloading contracts", () => {
    cy.mockAssetContractsWtihSample();
    cy.mockContractDownload();

    cy.visit("/studies/manage?studyId=123456789");
    cy.waitForAuth();
    cy.wait("@getStudyById");
    cy.wait("@getStudyAgreementText");
    cy.wait("@getStudyAgreementsConfirmed");
    cy.get('button[data-cy="assets-tab"').should("be.visible").click();
    cy.wait("@getAssetsWithSample");

    // Navigate to asset contracts
    cy.contains("Sample Asset Title 1").should("be.visible");
    cy.contains("Manage Asset").click();

    // Wait for asset and contracts to load
    cy.wait("@getAssetById");
    cy.wait("@getAssetContractsWithSample");

    // Verify contract is displayed
    cy.contains("sample-contract.pdf").should("be.visible");
    cy.contains("Active").should("be.visible");

    cy.contains("Download PDF").click();

    // Verify download request was made
    cy.wait("@downloadContract");
  });

  it("should prepopulate form fields when editing a contract", () => {
    cy.mockAssetContractsWtihSample();

    cy.visit("/studies/manage?studyId=123456789");
    cy.waitForAuth();
    cy.wait("@getStudyById");
    cy.wait("@getStudyAgreementText");
    cy.wait("@getStudyAgreementsConfirmed");
    cy.get("button").contains("Assets").should("be.visible").click();
    cy.wait("@getAssetsWithSample");

    cy.contains("Sample Asset Title 1").should("be.visible");
    cy.contains("Manage Asset").click();

    cy.wait("@getAssetById");
    cy.wait("@getAssetContractsWithSample");

    cy.contains("Edit").first().click();

    // Verify form is prepopulated with existing values
    cy.get("input[name='organisationSignatory']").should("have.value", "Sample Organization");
    cy.get("input[name='thirdPartyName']").should("have.value", "Sample Third Party");
    cy.get("select[name='status']").should("have.value", "active");
    cy.get("input[name='startDate']").should("have.value", "2024-01-01");
    cy.get("input[name='expiryDate']").should("have.value", "2025-12-31");

    // Verify the dialog title shows we're editing
    cy.contains("Edit Contract").should("be.visible");
    cy.contains("Current file: sample-contract.pdf").should("be.visible");
    cy.contains("Choose new PDF file (optional)").should("be.visible");
  });

  it("should successfully submit edited contract data", () => {
    cy.mockContractEdit();
    cy.mockAssetContractsWtihSample();

    cy.visit("/studies/manage?studyId=123456789");
    cy.waitForAuth();
    cy.wait("@getStudyById");
    cy.wait("@getStudyAgreementText");
    cy.wait("@getStudyAgreementsConfirmed");
    cy.get("button").contains("Assets").should("be.visible").click();
    cy.wait("@getAssetsWithSample");

    cy.contains("Sample Asset Title 1").should("be.visible");
    cy.contains("Manage Asset").click();

    cy.wait("@getAssetById");
    cy.wait("@getAssetContractsWithSample");

    cy.contains("Edit").first().click();

    // Modify a form field
    cy.get("select[name='status']").select("expired");

    // Submit the form
    cy.contains("Update Contract").click();

    cy.wait("@editContract");
    cy.wait("@getAssetContractsWithSample");

    // Verify the mock contract is displayed
    cy.contains("sample-contract.pdf").should("be.visible");
    cy.contains("Sample Organization").should("be.visible");
  });
});
