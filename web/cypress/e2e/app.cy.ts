describe("ARC Portal UI", () => {
  it("shows the ARC portal phrase on the homepage", () => {
    cy.visit("/");
    cy.contains("ARC portal").should("be.visible");
    cy.contains("fibble").should("not.exist");
  });
});
