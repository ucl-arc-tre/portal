beforeEach(() => {
  cy.clearCookies();
  cy.clearLocalStorage();
});

describe(`Homepage Tests`, () => {
  describe("Unauthenticated content", () => {
    it("shows the ARC portal phrase on the homepage", () => {
      cy.visit("/");
      cy.get("h1").should("be.visible");
    });
  });

  describe("Authenticated content", () => {
    it("can be logged into as a base user", () => {
      cy.loginAsBase();
      cy.mockAuthAsBaseUser();

      cy.visit("/");
      cy.waitForAuth();
      cy.contains("Your Tasks").should("exist");
    });

    it("can be logged into as an admin and encouraged to complete profile", () => {
      cy.loginAsAdmin();

      cy.mockAuthAsAdminBase();

      cy.visit("/");
      cy.waitForAuth();
      cy.contains("Your Tasks").should("exist");
    });
  });

  describe("User tasks", () => {
    beforeEach(() => {
      cy.loginAsBase();
      cy.visit("/");
    });

    it("shows tasks complete when profile is complete", () => {
      // Mock profile with chosen name
      cy.mockProfileChosenName("Tom Young");

      // Mock auth as approved researcher (complete profile)
      cy.mockAuthAsBaseApprovedResearcher();

      cy.visit("/");
      cy.waitForAuth();
      cy.waitForChosenName();

      cy.contains("You have completed all your tasks").should("be.visible");
    });

    it("shows studies for AR admin", () => {
      cy.loginAsAdmin();
      cy.mockProfileChosenName("Tom Young");
      cy.mockAuthAsAdminApprovedResearcher();

      cy.visit("/");
      cy.waitForAuth();
      cy.waitForChosenName();

      cy.contains("Studies to Approve").should("be.visible");
    });
  });

  describe("log out", () => {
    it("can log out", () => {
      cy.loginAsBase();
      cy.visit("/");
      cy.contains("Log out").click();
      cy.contains("Log out").should("not.exist");
    });
  });
});
