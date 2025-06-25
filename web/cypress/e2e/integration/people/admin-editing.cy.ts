import { botBaseUsername } from "../../../support/commands";

describe("Admin can edit people", () => {
  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.loginAsAdmin();
    cy.visit("/people");
  });

  it("can edit a person's training record", () => {
    cy.contains("tr", botBaseUsername).find("[data-cy='training']").contains("Edit").click();

    cy.get("select[name='training_kind']").select("nhsd");
    cy.get("button").contains("Submit").click();
    cy.contains("tr", botBaseUsername).find("[data-cy='training']").contains("nhsd").should("be.visible");
  });

  it("can edit a person's username", () => {
    cy.contains("tr", botBaseUsername).find("[data-cy='username']").contains("Edit").click();

    cy.get("input[name='username']").type("basebot@tre.com");
    cy.get("button").contains("Submit").click();
    cy.contains("basebot@tre.com").should("be.visible");
  });
});
