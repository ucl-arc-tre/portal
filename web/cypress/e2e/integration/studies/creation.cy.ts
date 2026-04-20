beforeEach(() => {
  cy.clearCookies();
  cy.clearLocalStorage();
});

describe("Study creation end-to-end", () => {
  const studyTitle = `study-${Date.now()}`;
  const assetTitle = `asset-${Date.now()}`;
  const contractTitle = `contract-${Date.now()}`;

  it("staff should become an approved researcher", () => {
    cy.loginAsStaff();
    cy.becomeApprovedResearcher();
  });

  it("ig ops staff should become an approved researcher", () => {
    cy.loginAsIGOps();
    cy.becomeApprovedResearcher();
  });

  it("staff should successfully create a study", () => {
    cy.loginAsStaff();

    // Visit page and wait for initial load
    cy.visit("/studies");

    cy.get('[data-cy="create-study-button"]').click();
    cy.get('[name="title"]').type(studyTitle);
    cy.get('[name="dataControllerOrganisation"]').type("UCL");
    cy.get('[data-cy="next"]').click();
    cy.get('[data-cy="next"]').click();
    cy.get("button[type='submit']").click();

    cy.contains(studyTitle)
      .parent()
      .parent()
      .within(() => {
        cy.get('[data-cy="manage-study-button"]').click();
      });
    cy.get('[data-cy="agreement-agree"]').click();

    // step 2: add an asset to complete setup
    cy.get('[data-cy="add-asset-button"]').click({ force: true });
    cy.get("input#title").type(assetTitle);
    cy.get('[name="description"]').type("Unknown");
    cy.get('[name="classification_impact"]').select("public");
    cy.get('[name="protection"]').select("anonymisation");
    cy.get('[name="legal_basis"]').select("consent");
    cy.get('[name="format"]').select("electronic");
    cy.get("input[name='has_expiry_date'][value='true']").check({ force: true });
    cy.get('[name="expires_at"]').type("2022-01-01");
    cy.get('[data-cy="create-asset-form"] input[value="arc_tre"]').check();
    cy.get("input[name='requires_contract'][value='false']").check({ force: true });
    cy.get("input[name='has_dspt'][value='false']").check({ force: true });
    cy.get("input[name='stored_outside_uk_eea'][value='false']").check({ force: true });
    cy.get('[name="status"]').select("active");
    cy.get("button[type='submit']").click();

    // setup complete — tabs now visible, edit study to add then remove an admin
    cy.contains("Incomplete").should("be.visible");

    const additionalAdminUsernamePrefix = "portal-e2e-admin";

    cy.get('[data-cy="edit-study-button"]').click();
    cy.get('[data-cy="add-study-admin-button"]').click();
    cy.get('[name="additionalStudyAdminUsernames.0.value"]').type(additionalAdminUsernamePrefix);
    cy.get('[data-cy="next"]').click();
    cy.get('[data-cy="next"]').click();
    cy.get("button[type='submit']").contains("Update Study").click();
    cy.contains("Update Study").should("not.exist");
    cy.contains("Edit Study").should("exist");
    cy.contains(additionalAdminUsernamePrefix).should("exist");

    // remove added study admin
    cy.get('[data-cy="edit-study-button"]').click();
    cy.get('[data-cy="remove-study-admin-button"]').click();
    cy.get('[data-cy="next"]').click();
    cy.get('[data-cy="next"]').click();
    cy.get("button[type='submit']").click();

    // mark as ready for review
    cy.get('[data-cy="study-ready-for-review-button"]').click();

    cy.contains("Case ref").should("exist");
    cy.contains("Last signed off").should("not.exist");
  });

  it("owner should be able to edit an asset", () => {
    cy.loginAsStaff();

    cy.visit("/studies");
    cy.contains(studyTitle).parents('[data-cy="study-card"]').contains("Manage Study").click();
    cy.get('[data-cy="study-assets"]').click();

    cy.contains('[data-cy="asset-card"]', assetTitle).contains("button", "Manage").click();

    cy.get('[data-cy="asset-edit"]').click();
    cy.get("input#title").clear({ force: true }).type(`${assetTitle} edited`, { force: true });
    cy.get("button[type='submit']").click();

    cy.contains(`${assetTitle} edited`).should("be.visible");
  });

  it("owner should be able to delete an asset", () => {
    const deleteAssetTitle = `asset-to-delete-${Date.now()}`;
    cy.loginAsStaff();

    cy.visit("/studies");
    cy.contains(studyTitle).parents('[data-cy="study-card"]').contains("Manage Study").click();
    cy.get('[data-cy="study-assets"]').click();

    cy.get('[data-cy="add-asset-button"]').click({ force: true });
    cy.get("input#title").type(deleteAssetTitle);
    cy.get('[name="description"]').type("Unknown");
    cy.get('[name="classification_impact"]').select("public");
    cy.get('[name="protection"]').select("anonymisation");
    cy.get('[name="legal_basis"]').select("consent");
    cy.get('[name="format"]').select("electronic");
    cy.get("input[name='has_expiry_date'][value='true']").check({ force: true });
    cy.get('[name="expires_at"]').type("2022-01-01");
    cy.get('[data-cy="create-asset-form"] input[value="arc_tre"]').check();
    cy.get("input[name='requires_contract'][value='false']").check({ force: true });
    cy.get("input[name='has_dspt'][value='false']").check({ force: true });
    cy.get("input[name='stored_outside_uk_eea'][value='false']").check({ force: true });
    cy.get('[name="status"]').select("active");
    cy.get("button[type='submit']").click();

    cy.contains('[data-cy="asset-card"]', deleteAssetTitle).contains("button", "Manage").click();

    cy.window().then((win) => cy.stub(win, "confirm").returns(true));
    cy.get('[data-cy="asset-delete"]').click();

    cy.url().should("include", "/studies/manage");
    cy.get('[data-cy="study-assets"]').click();
    cy.contains(deleteAssetTitle).should("not.exist");
  });

  it("owner should be able to add and edit contracts", () => {
    cy.loginAsStaff();

    cy.visit("/studies");
    cy.contains(studyTitle).parents('[data-cy="study-card"]').contains("Manage Study").click();
    cy.get('[data-cy="study-contracts"]').click();

    cy.get('[data-cy="add-contract"]').click();
    cy.get('[name="title"]').type(contractTitle);
    cy.env(["botStaffUsername"]).then(({ botStaffUsername }) => {
      cy.get('[name="organisationSignatory"]').type(botStaffUsername);
    });
    cy.get('[name="otherSignatories"]').type("other signatory");
    cy.get('[name="thirdPartyName"]').type("other");
    cy.get('[name="status"]').select("active");
    cy.get("input[name='startDate']").type("2024-01-01");
    cy.get("input[name='expiryDate']").type("2025-12-31");

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

    cy.contains(contractTitle).parents('[data-cy="contract-card"]').contains("Manage").click();
    cy.get('[data-cy="contract-edit"]').click();
    cy.get('[name="title"]').type("Test contract edited");
    cy.get('[data-cy="add-asset"]').click();
    cy.get('[name="assets.0.value"]').select(0);
    cy.get("button[type='submit']").click();

    cy.contains("Test contract edited").should("be.visible");

    cy.get('[data-cy="contract-object-download-button"]').click();
    cy.get('[data-cy="delete-contract-button"]').click();
  });

  it("ig ops should be able to search for a study", () => {
    cy.loginAsIGOps();
    cy.visit("/studies");
    cy.get('[data-cy="all-studies-tab-button"]').click();
    cy.get('[data-testid="ucl-uikit-search"]').type(`title:${studyTitle}`);
    cy.get('[data-testid="ucl-uikit-search-search-btn"]').click();
    cy.contains("[data-cy='study-card']", studyTitle).should("exist");
  });

  it("ig ops should be able to approve a study", () => {
    cy.loginAsIGOps();
    cy.visit("/studies");
    cy.get('[data-cy="all-studies-tab-button"]').click();
    cy.contains(studyTitle).parents('[data-cy="study-card"]').contains("Manage Study").click();
    cy.get('[data-cy="study-approve-button"]').click();
  });

  it("staff should see an approved study", () => {
    cy.loginAsStaff();

    cy.visit("/studies");
    cy.contains(studyTitle).parent().parent().get('[data-cy="status-badge"]').contains("Approved").should("exist");

    cy.contains(studyTitle)
      .parent()
      .parent()
      .within(() => {
        cy.get('[data-cy="manage-study-button"]').click();
      });
    cy.contains("Last signed off").should("exist");
  });
});
