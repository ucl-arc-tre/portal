beforeEach(() => {
  cy.clearCookies();
  cy.clearLocalStorage();

  cy.loginAsStaff();
  cy.becomeApprovedResearcher();
});

describe("Study management end-to-end", () => {
  it("staff should be able to manage an asset", () => {
    cy.visit("/studies");

    cy.get('[data-cy="manage-study-button"]').first().click();

    cy.contains("Study Overview").should("be.visible");
    cy.contains("Contracts").should("be.visible");
    cy.contains("Assets").should("be.visible").click();

    cy.contains("Manage Asset").should("be.visible").click();

    cy.contains("Asset Details").should("be.visible");
    cy.contains("Add Contract").should("be.visible").click();
  });
});
