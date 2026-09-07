beforeEach(() => {
  cy.clearCookies();
  cy.clearLocalStorage();
});

describe("Project access review warning", () => {
  const projectId = "deployed-project-123";
  const environment = "ARC Trusted Research Environment";

  beforeEach(() => {
    cy.loginAsBase();
    cy.mockAuthAsStudyOwner();
    cy.mockProfileChosenName("Test User");

    cy.intercept("GET", `/web/api/v0/projects/tre/${projectId}`, { fixture: "project-tre-deployed.json" }).as(
      "getProject"
    );
    cy.visit(`/projects/manage?projectId=${projectId}&environment=${encodeURIComponent(environment)}`);
    cy.waitForAuth();
    cy.wait("@getProject");
  });

  it("shows the access review warning when a review is due", () => {
    cy.contains("Project access review").should("exist");
    cy.contains("Confirm Details").should("be.disabled");
  });

  it("enables the confirm button only after checking the checkbox", () => {
    cy.get("[data-cy='project-access-review-confirm-checkbox']").click();
    cy.contains("Confirm Details").should("not.be.disabled");
  });

  it("submits the signoff and hides the warning", () => {
    cy.fixture("project-tre-deployed.json").then((project) => {
      cy.intercept("GET", `/web/api/v0/projects/tre/${projectId}`, {
        body: { ...project, last_access_review: new Date().toISOString() },
      });
    });

    cy.intercept("POST", `/web/api/v0/projects/tre/${projectId}/access-review-signoff`, { statusCode: 200 }).as(
      "postAccessReviewSignoff"
    );

    cy.get("[data-cy='project-access-review-confirm-checkbox']").click();
    cy.contains("Confirm Details").click();

    cy.wait("@postAccessReviewSignoff");
    cy.contains("Project access review").should("not.exist");
  });
});
