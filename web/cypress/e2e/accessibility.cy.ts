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

describe("Accessibility - ARC Portal Profile page", () => {
  it("should have no critical or serious accessibility violations on initial load", () => {
    cy.visit("/profile");

    cy.injectAxe();
    cy.checkA11y(undefined, {
      includedImpacts: ["critical", "serious"],
    });
  });
});
