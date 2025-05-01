describe("ARC Portal UI unauthenticated", () => {
  it("shows the ARC portal phrase on the homepage", () => {
    cy.visit("/");

    cy.get("#title--portal").should("be.visible");
    cy.contains("fibble").should("not.exist");
  });
});

describe("ARC Portal UI authenticated", () => {
  it("can be logged into as an admin", () => {
    cy.loginAsAdmin();
    cy.visit("/");
    cy.get("#confirmation--login").should("exist");
    cy.contains("GET /profile").should("exist");
  });
});
