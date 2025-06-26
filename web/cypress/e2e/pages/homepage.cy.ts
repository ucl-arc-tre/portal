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
    it("can be logged into as an admin", () => {
      cy.loginAsAdmin();

      cy.visit("/");
      cy.contains("Username").should("exist");
    });
  });

  describe("User experience", () => {
    beforeEach(() => {
      cy.loginAsBase();
      cy.clearChosenName();
      cy.visit("/");
    });

    it("shows profile setup prompt when no chosen name", () => {
      cy.contains("Complete Your Profile Setup").should("be.visible");
      cy.contains("Complete Profile Setup").should("be.visible");
    });

    it("shows user info when profile is complete", () => {
      // Mock profile with chosen name
      cy.intercept("GET", "/api/v0/profile", {
        statusCode: 200,
        body: {
          chosen_name: "Test User",
        },
      }).as("getProfile");

      // Mock auth as approved researcher (complete profile)
      cy.mockAuthAsBaseApprovedResearcher();

      cy.visit("/");
      cy.waitForMockedAuth();
      cy.wait("@getProfile");

      // Should now show user information instead of setup prompt
      cy.contains("Chosen name:").should("be.visible");
      cy.contains("Test User").should("be.visible");
      cy.contains("Username").should("be.visible");
      cy.contains("Roles:").should("be.visible");
    });
  });
});
