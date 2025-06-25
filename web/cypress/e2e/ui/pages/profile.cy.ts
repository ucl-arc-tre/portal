beforeEach(() => {
  cy.clearCookies();
  cy.clearLocalStorage();
});

describe("Profile Page Step Workflow UI", () => {
  beforeEach(() => {
    cy.loginAsBase();
  });

  it("displays step progress indicator with step 1 current", () => {
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

    cy.get("[aria-label='Profile setup progress']").should("be.visible");

    // Should show 3 steps
    cy.get("[aria-label='Profile setup progress'] li").should("have.length", 3);

    // Step titles should be visible
    cy.contains("Set Your Chosen Name").should("be.visible");
    cy.contains("Approved Researcher Agreement").should("be.visible");
    cy.contains("Training Certificate").should("be.visible");
  });

  it("only shows current step content", () => {
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

    // Should only show chosen name form initially
    cy.get("[data-cy='chosen-name-form']").should("be.visible");
    cy.get("[data-cy='approved-researcher-agreement']").should("not.exist");
    cy.get("[data-cy='training-certificate']").should("not.exist");
  });

  it("validates chosen name input", () => {
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

    cy.get("[data-cy='chosen-name-form'] input").type("123");
    cy.get("[data-cy='chosen-name-form'] button[type='submit']").click();

    cy.contains("Please enter a valid name").should("be.visible");

    // Should still be on step 1
    cy.get("[data-cy='chosen-name-form']").should("be.visible");
  });

  it("shows step 2 when chosen name is completed", () => {
    // Mock auth without approved-researcher role
    cy.intercept("GET", "/api/v0/auth", {
      statusCode: 200,
      body: {
        username: "testuser",
        roles: ["base"],
        enabled: true,
      },
    }).as("getAuth");

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
    cy.wait("@getAuth");
    cy.wait("@getProfile");
    cy.wait("@getAgreements");

    // Should show step 2 content
    cy.get("[data-cy='approved-researcher-agreement']").should("be.visible");
    cy.get("[data-cy='chosen-name-form']").should("not.exist");
  });

  it("shows step 3 when chosen name and agreement completed", () => {
    // Mock auth without approved-researcher role
    cy.intercept("GET", "/api/v0/auth", {
      statusCode: 200,
      body: {
        username: "testuser",
        roles: ["base"],
        enabled: true,
      },
    }).as("getAuth");

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
    cy.wait("@getAuth");
    cy.wait("@getProfile");
    cy.wait("@getAgreements");

    // Should show step 3 content
    cy.get("[data-cy='training-certificate']").should("be.visible");
    cy.get("[data-cy='approved-researcher-agreement']").should("not.exist");
    cy.get("[data-cy='chosen-name-form']").should("not.exist");
  });

  it("shows completion state when all steps done", () => {
    // Mock auth as approved researcher (complete profile)
    cy.mockAuthAsBaseApprovedResearcher();

    // Mock profile with chosen name
    cy.intercept("GET", "/api/v0/profile", {
      statusCode: 200,
      body: {
        chosen_name: "Complete User",
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

    // Should show completion message instead of steps
    cy.contains("Profile Complete").should("be.visible");
    cy.get("[data-cy='chosen-name-form']").should("not.exist");
    cy.get("[data-cy='approved-researcher-agreement']").should("not.exist");
    cy.get("[data-cy='training-certificate']").should("not.exist");
  });
});
