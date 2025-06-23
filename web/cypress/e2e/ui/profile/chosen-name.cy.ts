beforeEach(() => {
  cy.clearCookies();
  cy.clearLocalStorage();
});

describe("Setting chosen name for user", () => {
  beforeEach(() => {
    cy.loginAsBase();
    cy.clearChosenName();
    cy.visit("/");
  });

  const chosenName = (Cypress.env("chosenName") as string) || "Test Chosen Name";

  it("prompts user to set chosen name", () => {
    cy.get("dialog[data-cy='chosenName']").should("be.visible");
  });

  it("can submit chosen name form", () => {
    // Mock the API call
    cy.intercept("POST", "/api/v0/profile", {
      statusCode: 200,
    }).as("saveProfile");

    cy.get("dialog[data-cy='chosenName']").find("input").type(chosenName);
    cy.get("dialog[data-cy='chosenName']").find("button").click();

    // Verify API was called correctly
    cy.wait("@saveProfile").then((interception) => {
      expect(interception.request.body).to.have.property("chosen_name", chosenName);
    });

    // Verify dialog closes
    cy.get("dialog[data-cy='chosenName']").should("not.exist");
  });

  it("can't set invalid name", () => {
    cy.get("dialog[data-cy='chosenName']").within(() => {
      cy.get("input").type("123533");
      cy.get("button").click();
      cy.get("[data-testid='ucl-uikit-alert']").should("be.visible").and("contain", "Please enter a valid name");
    });

    // Make sure the dialog is still open
    cy.get("dialog[data-cy='chosenName']").should("be.visible");
  });
});
