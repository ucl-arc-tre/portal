beforeEach(() => {
  cy.clearCookies();
  cy.clearLocalStorage();
});

describe("Study signoff warning", () => {
  const studyId = "approved-study-123";

  beforeEach(() => {
    cy.loginAsBase();
    cy.mockAuthAsStudyOwner();
    cy.mockProfileChosenName("Test User");
    cy.mockInformationAssetsWithSampleNoContracts();
    cy.mockStudyContractsEmpty();
    cy.mockStudyAgreementsConfirmed();

    cy.intercept("GET", `/web/api/v0/studies/${studyId}`, { fixture: "study-approved.json" }).as("getStudy");
    cy.visit(`/studies/manage?studyId=${studyId}`);
    cy.waitForAuth();
    cy.wait("@getStudy");
  });

  it("shows the signoff warning for a study owner when confirmation is due", () => {
    cy.contains("As Study Owner you're required to confirm that your study").should("exist");
    cy.contains("Confirm Details").should("be.disabled");
  });

  it("enables the confirm button only after checking the checkbox", () => {
    cy.contains("I confirm the above details are correct").click();
    cy.contains("Confirm Details").should("not.be.disabled");
  });

  it("submits the signoff and hides the warning", () => {
    cy.fixture("study-approved.json").then((study) => {
      cy.intercept("GET", `/web/api/v0/studies/${studyId}`, {
        body: { ...study, last_signoff: new Date().toISOString() },
      });
    });

    cy.intercept("POST", `/web/api/v0/studies/${studyId}/signoff`, { statusCode: 200 }).as("postSignoff");

    cy.contains("I confirm the above details are correct").click();
    cy.contains("Confirm Details").click();

    cy.wait("@postSignoff");
    cy.contains("As Study Owner you're required to confirm that your study").should("not.exist");
  });
});
