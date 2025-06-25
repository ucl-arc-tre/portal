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
      // Mock profile with no chosen name
      cy.intercept("GET", "/api/v0/profile", {
        statusCode: 200,
        body: {},
      }).as("getProfile");

      // Mock agreements with no confirmed agreements
      cy.intercept("GET", "/api/v0/profile/agreements", {
        statusCode: 200,
        body: {
          confirmed_agreements: [],
        },
      }).as("getAgreements");

      cy.visit("/profile");
      cy.wait("@getProfile");
      cy.wait("@getAgreements");

      cy.contains("Set Your Chosen Name").should("be.visible");

      cy.injectAxe();
      cy.checkA11y(undefined, {
        includedImpacts: ["critical", "serious"],
      });
    });

    it("should have no accessibility violations on step 2 (chosen name set, no agreement)", () => {
      // Mock profile with chosen name
      cy.intercept("GET", "/api/v0/profile", {
        statusCode: 200,
        body: {
          chosen_name: "Test User",
        },
      }).as("getProfile");

      // Mock agreements with no confirmed agreements
      cy.intercept("GET", "/api/v0/profile/agreements", {
        statusCode: 200,
        body: {
          confirmed_agreements: [],
        },
      }).as("getAgreements");

      cy.visit("/profile");
      cy.wait("@getProfile");
      cy.wait("@getAgreements");

      cy.get("main").should("be.visible");
      cy.contains("Approved Researcher Agreement").should("be.visible");
      cy.contains("You are reminded that").should("be.visible");

      cy.injectAxe();
      cy.checkA11y(undefined, {
        includedImpacts: ["critical", "serious"],
      });
    });

    it("should have no accessibility violations on step 3 (chosen name and agreement completed)", () => {
      // Mock profile with chosen name
      cy.intercept("GET", "/api/v0/profile", {
        statusCode: 200,
        body: {
          chosen_name: "Test User",
        },
      }).as("getProfile");

      // Mock agreements with approved-researcher agreement confirmed
      cy.intercept("GET", "/api/v0/profile/agreements", {
        statusCode: 200,
        body: {
          confirmed_agreements: [
            {
              agreement_type: "approved-researcher",
              confirmed_at: "2024-01-01T00:00:00Z",
            },
          ],
        },
      }).as("getAgreements");

      cy.visit("/profile");
      cy.wait("@getProfile");
      cy.wait("@getAgreements");

      cy.get("main").should("be.visible");
      cy.contains("Training Certificate").should("be.visible");

      cy.injectAxe();
      cy.checkA11y(undefined, {
        includedImpacts: ["critical", "serious"],
      });
    });
  });

  describe("Base user - complete profile scenario", () => {
    beforeEach(() => {
      // Mock auth as approved researcher (complete profile)
      cy.mockAuthAsBaseApprovedResearcher();
    });

    it("should have no accessibility violations when profile is complete", () => {
      // Mock profile with chosen name
      cy.intercept("GET", "/api/v0/profile", {
        statusCode: 200,
        body: {
          chosen_name: "Test User",
        },
      }).as("getProfile");

      // Mock agreements with approved-researcher agreement confirmed
      cy.intercept("GET", "/api/v0/profile/agreements", {
        statusCode: 200,
        body: {
          confirmed_agreements: [
            {
              agreement_type: "approved-researcher",
              confirmed_at: "2024-01-01T00:00:00Z",
            },
          ],
        },
      }).as("getAgreements");

      cy.visit("/profile");
      cy.waitForMockedAuth();
      cy.wait("@getProfile");
      cy.wait("@getAgreements");

      cy.get("main").should("be.visible");
      cy.contains("Profile Complete!").should("be.visible");

      cy.injectAxe();
      cy.checkA11y(undefined, {
        includedImpacts: ["critical", "serious"],
      });
    });
  });
});
