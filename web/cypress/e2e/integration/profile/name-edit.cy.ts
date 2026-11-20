beforeEach(() => {
  cy.clearCookies();
  cy.clearLocalStorage();
});

describe("Name self-editing", () => {
  it("can visit profile and change the name to something close", () => {
    cy.loginAsStaff();
    cy.becomeApprovedResearcher();

    cy.visit("/profile");
    cy.get('[data-cy="edit-chosen-name"]').click();
    cy.get("#chosenName").clear().type("Thomas Young");
    cy.get('[data-cy="request-name-change"]').click();

    // approval not needed, so pending tooltip should not be present, but the new name should be
    cy.get('[data-cy="name-change-pending"]').should("not.exist");
    cy.get('[data-cy="chosen-name-value"]').should("contain.text", "Thomas Young");

    // Should be able to change it back.
    cy.get('[data-cy="edit-chosen-name"]').click();
    cy.get("#chosenName").clear().type("Tom Young");
    cy.get('[data-cy="request-name-change"]').click();

    cy.get('[data-cy="chosen-name-value"]').should("contain.text", "Tom Young");
  });
});
