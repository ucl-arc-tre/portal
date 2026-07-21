beforeEach(() => {
  cy.clearCookies();
  cy.clearLocalStorage();
});

describe("Name editing", () => {
  it("can visit profile and change the name to something close", () => {
    cy.loginAsStaff();
    cy.becomeApprovedResearcher();

    cy.visit("/profile");
    cy.get('[data-cy="edit-chosen-name"]').click();
    cy.get("#chosenName").clear().type("Thomas Young");
    cy.get('[data-cy="request-name-change"]').click();

    // Should be able to change it back. If it was pending then must wait for approval
    cy.get('[data-cy="edit-chosen-name"]').click();
    cy.get("#chosenName").clear().type("Tom Young");
    cy.get('[data-cy="request-name-change"]').click();
  });
});
