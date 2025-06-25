beforeEach(() => {
  cy.clearCookies();
  cy.clearLocalStorage();
});

["light", "dark"].forEach((mode) => {
  describe(`People page content (${mode} mode)`, () => {
    beforeEach(() => {
      if (mode === "light") {
        cy.forceLightMode();
      } else {
        cy.forceDarkMode();
      }
    });

    it("should show nothing to base role", () => {
      cy.loginAsBase();
      cy.mockAuthAsBaseUser();
      cy.visit("/people");
      cy.waitForMockedAuth();

      cy.contains("You do not have permission to view this page").should("be.visible");
    });

    it("should show content for base approved researcher", () => {
      cy.loginAsBase();
      cy.mockAuthAsBaseApprovedResearcher();
      cy.visit("/people");
      cy.waitForMockedAuth();

      cy.contains("You do not have permission to view this page").should("not.exist");
      cy.contains("Approved Researcher").should("be.visible");
    });

    it("should show content for admin", () => {
      cy.loginAsAdmin();
      cy.visit("/people");

      cy.contains("You do not have permission to view this page").should("not.exist");
      cy.get("table").contains("User").should("be.visible");
      cy.contains(Cypress.env("botAdminUsername")).should("be.visible");
    });
  });
});
