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
    cy.get("[data-cy=set-to-today]").click();
    cy.get("[name='training_date']").should("not.be.visible");
    cy.get("button").contains("Submit").click();
    cy.contains("tr", botBaseUsername).find("[data-cy='training']").contains("nhsd").should("be.visible");
  });
});
