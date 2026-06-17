beforeEach(() => {
  cy.clearCookies();
  cy.clearLocalStorage();
});

describe("Study owner change end-to-end", () => {
  const studyTitle = `study-${Date.now()}`;
  const assetTitle = `asset-${Date.now()}`;

  it("staff should become an approved researcher", () => {
    cy.loginAsStaff();
    cy.becomeApprovedResearcher();
  });

  it("staff2 should become an approved researcher", () => {
    cy.loginAsStaff2();
    cy.becomeApprovedResearcher();
  });

  it("ig ops staff should become an approved researcher", () => {
    cy.loginAsIGOps();
    cy.becomeApprovedResearcher();
  });

  it("staff should successfully create a study", () => {
    cy.loginAsStaff();

    // Create study
    cy.visit("/studies");
    cy.get('[data-cy="create-study-button"]').click();
    cy.get('[name="title"]').type(studyTitle);
    cy.get('[name="description"]').type("Test study");
    cy.get('[name="dataControllerOrganisation"]').type("UCL");
    cy.get('[data-cy="next"]').click();
    cy.get('[data-cy="next"]').click();
    cy.get("button[type='submit']").click();

    cy.contains(studyTitle).click();
    cy.get('[data-cy="agreement-agree"]').click();

    // Add an asset to complete setup
    cy.get('[data-cy="add-asset-button"]').click({ force: true });
    cy.get("input#title").type(assetTitle);
    cy.get('[name="description"]').type("Unknown");
    cy.get('[name="classification_impact"]').select("public");
    cy.get('[name="format"]').select("electronic");
    cy.get("input[name='has_expiry_date'][value='true']").check({ force: true });
    cy.get('[name="expires_at"]').type("2022-01-01");
    cy.get('[data-cy="create-asset-form"] input[value="arc_tre"]').check();
    cy.get("input[name='requires_contract'][value='false']").check({ force: true });
    cy.get("input[name='has_dspt'][value='false']").check({ force: true });
    cy.get("input[name='stored_outside_uk_eea'][value='false']").check({ force: true });
    cy.get('[name="status"]').select("active");
    cy.get("button[type='submit']").click();

    // Mark as ready for review
    cy.get('[data-cy="study-ready-for-review-button"]').click();
    cy.get('[data-cy="study-affirmation-confirm-checkbox"]').check();
    cy.get('[data-cy="study-affirmation-confirm-button"]').click();
  });

  it("ig ops should be able to approve a study", () => {
    cy.loginAsIGOps();
    cy.visit("/studies");
    cy.get('[data-cy="all-studies-tab-button"]').click();
    cy.contains(studyTitle).click();
    cy.get('[data-cy="study-approve-button"]').click();
  });

  it("staff should be able to request owner change", () => {
    cy.loginAsStaff();
    cy.visit("/studies");

    cy.contains(studyTitle).click();
    cy.get('[data-cy="study-owner-edit-icon"]').click();
    cy.get('input[name="email"]').type("portal-e2e-staff2@arctretest.onmicrosoft.com");
    cy.get('[data-cy="request-study-owner-edit-submit"]').click();
  });

  it("ig should be able to approve the owner request change", () => {
    cy.loginAsIGOps();

    cy.visit("/studies");
    cy.get('[data-cy="all-studies-tab-button"]').click();
    cy.contains(studyTitle).click();
    cy.get('[data-cy="study-owner-change-approve-button"]').click();
  });

  it("staff2 should be able to see their new study", () => {
    cy.loginAsStaff2();
    cy.visit("/studies");

    cy.contains(studyTitle).click();
    cy.get('[data-cy="agreement-agree"]').click();
  });
});
