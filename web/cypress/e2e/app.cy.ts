beforeEach(() => {
  cy.clearCookies();
  cy.clearLocalStorage();
});

describe("ARC Portal UI unauthenticated", () => {
  it("shows the ARC portal phrase on the homepage", () => {
    cy.visit("/");

    cy.get("h1").should("be.visible");
    cy.contains("fibble").should("not.exist");
  });
});

describe("ARC Portal UI authenticated", () => {
  it("can be logged into as an admin", () => {
    cy.loginAsAdmin();

    cy.visit("/");
    cy.contains("Loading...").should("not.exist");
    cy.contains("List of user tasks here").should("exist");
  });

  it("admin user can agree to approved researcher agreement", () => {
    cy.loginAsAdmin();
    cy.visit("/profile/approved-researcher");

    cy.get("[data-cy='approved-researcher-agreement']"); // wait for load

    cy.get("body").then((body) => {
      if (body.find("[data-cy='approved-researcher-agreement-text']").length > 0) {
        cy.get("[data-cy='approved-researcher-agreement-text']").should("be.visible");
        cy.get("input[name='agreed'][type='checkbox']").check();
        cy.get("[data-cy='approved-researcher-agreement-agree']").click();
      }
    });

    cy.contains("Agreement confirmed").should("be.visible");
  });
});

describe("Setting chosen name for user", () => {
  const chosenName = (Cypress.env("chosenName") as string) || "Test Chosen Name";

  it("prompts user to set chosen name", () => {
    cy.loginAsAdmin();
    cy.clearChosenName();
    cy.visit("/");

    cy.get("dialog[data-cy='chosenName']").should("be.visible");
  });

  it("can set chosen name", () => {
    cy.loginAsAdmin();
    cy.clearChosenName();
    cy.visit("/");

    cy.get("dialog[data-cy='chosenName']").find("input").type(chosenName);
    cy.get("dialog[data-cy='chosenName']").find("button").click();
    cy.reload();
    cy.contains(chosenName).should("be.visible");
    cy.clearChosenName();
  });
});
