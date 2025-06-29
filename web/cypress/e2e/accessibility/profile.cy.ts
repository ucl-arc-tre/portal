import "cypress-axe";

["light", "dark"].forEach((mode) => {
  describe(`Accessibility - Profile Page (${mode} mode)`, () => {
    beforeEach(() => {
      cy.clearCookies();
      cy.clearLocalStorage();

      if (mode === "light") {
        cy.forceLightMode();
      } else {
        cy.forceDarkMode();
      }
    });

    describe("Base user - incomplete profile scenarios", () => {
      beforeEach(() => {
        cy.loginAsBase();
      });

      it("should have no accessibility violations on step 1 (no chosen name)", () => {
        cy.mockProfileChosenName(); // No chosen name
        cy.mockProfileAgreements(false); // No agreements
        cy.mockProfileTraining(false); // No training

        cy.visit("/profile");
        cy.wait("@getProfile");
        cy.wait("@getAgreements");
        cy.wait("@getTraining");

        cy.contains("Set Your Chosen Name").should("be.visible");

        cy.checkAccessibility();
      });

      it("should have no accessibility violations on step 2 (chosen name set, no agreement)", () => {
        cy.mockProfileChosenName("Test User"); // Has chosen name
        cy.mockProfileAgreements(false); // No agreements yet
        cy.mockProfileTraining(false); // No training yet

        cy.visit("/profile");
        cy.wait("@getProfile");
        cy.wait("@getAgreements");
        cy.wait("@getTraining");

        cy.get("main").should("be.visible");
        cy.contains("Approved Researcher Agreement").should("be.visible");
        cy.contains("You are reminded that").should("be.visible");

        cy.checkAccessibility();
      });

      it("should have no accessibility violations on step 3 (chosen name and agreement completed)", () => {
        cy.mockProfileChosenName("Test User"); // Has chosen name
        cy.mockProfileAgreements(true); // Agreement completed
        cy.mockProfileTraining(false); // Training not complete (this is why we see step 3)

        cy.visit("/profile");
        cy.wait("@getProfile");
        cy.wait("@getAgreements");
        cy.wait("@getTraining");

        cy.get("main").should("be.visible");
        cy.contains("Training Certificate").should("be.visible");

        cy.checkAccessibility();
      });
    });

    describe("Base user - complete profile scenario", () => {
      beforeEach(() => {
        // Mock auth as approved researcher (complete profile)
        cy.mockAuthAsBaseApprovedResearcher();
      });

      it("should have no accessibility violations when profile is complete", () => {
        cy.mockProfileChosenName("Test User"); // Has chosen name
        cy.mockProfileAgreements(true); // Agreement completed
        cy.mockProfileTraining(true, "2024-01-01T00:00:00Z"); // Training completed

        cy.visit("/profile");
        cy.waitForMockedAuth();
        cy.wait("@getProfile");
        cy.wait("@getAgreements");
        cy.wait("@getTraining");

        cy.get("main").should("be.visible");
        cy.contains("Profile Complete!").should("be.visible");

        cy.checkAccessibility();
      });
    });
  });
});
