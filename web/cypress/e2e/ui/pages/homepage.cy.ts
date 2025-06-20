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
    cy.loginAsBase();

    cy.visit("/");
    cy.contains("Username").should("exist");
  });
});
