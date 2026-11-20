beforeEach(() => {
  cy.clearCookies();
  cy.clearLocalStorage();
});

describe("Make name edit requiring approval", () => {
  it("can visit profile and change the name to something requiring approval", () => {
    cy.loginAsStaff();
    cy.becomeApprovedResearcher();

    cy.visit("/profile");
    cy.get('[data-cy="edit-chosen-name"]').click();
    cy.get("#chosenName").clear().type("Jeremy Stein");
    cy.get('[data-cy="request-name-change"]').click();

    // name change requires approval, so the pending approval tooltip should exist, edit disappears,
    // and the new name should be visible
    cy.get('[data-cy="name-change-pending"]').should("exist");
    cy.get('[data-cy="chosen-name-value"]').should("contain.text", "Jeremy Stein");
    cy.get('[data-cy="edit-chosen-name"]').should("not.exist");
  });

  it("admin approves", () => {
    cy.loginAsIGAdmin();
    cy.becomeApprovedResearcher();

    // use the notifications API to find the user whose name change we want to approve
    cy.fetchNotificationsMatching("user-name-change-request", "requested a name change to 'Jeremy Stein'").then(
      (allRequests) => {
        const lastRequest = allRequests.at(-1);
        expect(lastRequest, "name change notification not found").to.exist;
        cy.visit(lastRequest!.href!);
      }
    );

    // approve button should exist, click it and it disappears
    cy.get('[data-cy="approve-name-change-button"]').click();
    cy.get('[data-cy="approve-name-change-button"]').should("not.exist");
  });

  it("can visit profile and see that name change has been approved", () => {
    cy.loginAsStaff();
    cy.becomeApprovedResearcher();

    cy.visit("/profile");
    // ability to edit returns once name is approved
    cy.get('[data-cy="edit-chosen-name"]').should("be.visible");
    cy.get('[data-cy="chosen-name-value"]').should("contain.text", "Jeremy Stein");

    cy.get('[data-cy="name-change-pending"]').should("not.exist");
  });

  it("also check that our name change approval generated a notification", () => {
    cy.loginAsStaff();
    cy.becomeApprovedResearcher();

    cy.fetchNotificationsMatching("user-name-change-occurred", "been changed to 'Jeremy Stein'").then((allRequests) => {
      const lastRequest = allRequests.at(-1);
      expect(lastRequest, "name change notification not found").to.exist;
    });
  });
});
