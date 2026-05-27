beforeEach(() => {
  cy.clearCookies();
  cy.clearLocalStorage();
});

describe("TRE project creation end-to-end", () => {
  const studyTitle = `study-tre-project-${Date.now()}`;
  const assetTitle = `asset-tre-project-${Date.now()}`;
  const projectTitle = `tre${Date.now()}`.substring(0, 14);

  it("staff member should create a study", () => {
    cy.loginAsStaff();
    cy.becomeApprovedResearcher();
    cy.visit("/studies");

    // Create a study
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

    // add an asset to complete setup
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

    cy.get('[data-cy="study-ready-for-review-button"]').click();
  });

  it("ig ops staff should approve the study", () => {
    cy.loginAsIGOps();
    cy.becomeApprovedResearcher();

    cy.visit("/studies");
    cy.get('[data-cy="all-studies-tab-button"]').click();
    cy.contains(studyTitle).parents('[data-cy="study-card"]').contains("Manage Study").click();
    cy.get('[data-cy="study-approve-button"]').click();
  });

  it("staff member should create a project", () => {
    cy.loginAsStaff();

    cy.visit("/projects");
    cy.get('[data-cy="create-project-button"]').click();
    cy.get('[name="studyId"]').select(1); // first study option
    cy.get('[name="environmentId"]').select(1);
    cy.get('[name="name"]').type(projectTitle);
    cy.get('[data-cy="next-form-page-button"]').click();
    cy.get('[data-cy="submit-project-button"]').click();
  });

  it("staff member should be able to see the project once created", () => {
    cy.loginAsStaff();

    cy.visit("/projects");
    cy.contains(projectTitle).should("exist");
  });
});
