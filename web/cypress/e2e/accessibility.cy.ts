import "cypress-axe";

describe("Accessibility - ARC Portal Homepage", () => {
  it("should have no critical or serious accessibility violations on initial load", () => {
    cy.visit("/");

    cy.injectAxe();
    cy.checkA11y(undefined, {
      includedImpacts: ["critical", "serious"],
    });
  });
});
