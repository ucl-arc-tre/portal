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
      cy.contains("Your Tasks").should("exist");
    });
  });

  describe("User tasks", () => {
    beforeEach(() => {
      cy.loginAsBase();
      cy.visit("/");
    });

    it("shows profile setup prompt when no chosen name", () => {
      cy.contains("Continue Profile Setup").should("be.visible");
    });

    it("shows tasks complete when profile is complete", () => {
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

      cy.contains("You have completed all your tasks").should("be.visible");
    });
  });
});
