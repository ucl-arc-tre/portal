beforeEach(() => {
  cy.clearCookies();
  cy.clearLocalStorage();
});

describe("Sensitive REDCap project creation end-to-end", () => {
  const studyTitle = `study-redcap-project-${Date.now()}`;
  const assetTitle = `asset-redcap-project-${Date.now()}`;
  const projectTitle = `rc${Date.now()}`.slice(-14);
  const projectDescription = "Test Sensitive REDCap project";

  it("staff member should create a study", () => {
    cy.loginAsStaff();
    cy.becomeApprovedResearcher();
    cy.createStudyForReview(studyTitle, assetTitle);
  });

  it("ig ops staff should approve the study", () => {
    cy.loginAsIGOps();
    cy.becomeApprovedResearcher();

    cy.visit("/studies");
    cy.get('button[data-cy="all"]').click();
    cy.get('[data-testid="ucl-uikit-search"]').type(`title:${studyTitle}`);
    cy.get('[data-testid="ucl-uikit-search-search-btn"]').click();
    cy.contains(studyTitle).click();
    cy.get('[data-cy="study-approve-button"]').click();
  });

  // The app must be built with NEXT_PUBLIC_ENABLE_REDCAP_PROJECTS=true.
  it("staff member should create a REDCap project", () => {
    cy.loginAsStaff();

    cy.intercept("POST", "/web/api/v0/projects/sensitiveredcap").as("createRedcapProject");
    cy.visit("/projects");
    cy.get('[data-cy="create-project-button"]').click();
    cy.get('[name="studyId"]').select(studyTitle);
    cy.get('[name="environmentId"]').select("Sensitive REDCap (Tier 3)");
    cy.get('[name="name"]').type(projectTitle);
    cy.get('[data-cy="next-form-page-button"]').click();
    cy.get('[name="description"]').type(projectDescription);
    cy.get('[data-cy="submit-project-button"]').click();

    cy.wait("@createRedcapProject").then(({ request, response }) => {
      expect(response?.statusCode).to.equal(204);
      expect(request.body).to.include({ name: projectTitle, description: projectDescription });
      expect(request.body.project_tre_ids).to.deep.equal([]);
      expect(request.body.project_dsh_ids).to.deep.equal([]);
    });
  });

  it("staff member should be able to see the REDCap project once created", () => {
    cy.loginAsStaff();

    cy.visit("/projects");
    cy.contains(projectTitle).should("be.visible").click();
    cy.contains(projectDescription).should("be.visible");
    cy.contains("Sensitive REDCap").should("be.visible");
    cy.contains("Linked TRE Projects").should("be.visible");
    cy.contains("Linked DSH Projects").should("be.visible");
  });
});
