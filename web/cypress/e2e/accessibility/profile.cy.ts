import "cypress-axe";

describe("Accessibility - Profile Page", () => {
  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
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
      cy.waitForProfileData();

      cy.contains("Set Your Chosen Name").should("be.visible");

      cy.checkAccessibility();
    });

    it("should have no accessibility violations on step 2 (chosen name set, no agreement)", () => {
      cy.mockProfileChosenName("Test User"); // Has chosen name
      cy.mockProfileAgreements(false); // No agreements yet
      cy.mockProfileTraining(false); // No training yet

      cy.visit("/profile");
      cy.waitForProfileData();

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
      cy.waitForProfileData();

      cy.get("main").should("be.visible");
      cy.contains("Training Certificate").should("be.visible");

      cy.checkAccessibility();
    });
  });

  describe("Base user - complete profile scenario", () => {
    beforeEach(() => {
      // Mock auth as approved researcher (complete profile)
      cy.mockAuthAsBaseStaffApprovedResearcher();
    });

    it("should have no accessibility violations when profile is complete", () => {
      cy.mockProfileChosenName("Test User"); // Has chosen name
      cy.mockProfileAgreements(true); // Agreement completed
      cy.mockProfileTraining(true, new Date().toISOString()); // Training completed

      cy.visit("/profile");
      cy.waitForAuth();
      cy.waitForProfileData();

      cy.get("main").should("be.visible");
      cy.contains("Upload another certificate").should("be.visible");

      cy.checkAccessibility();
    });
  });
});
