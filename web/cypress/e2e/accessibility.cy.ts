import "cypress-axe";

const pages = [
  { name: "Homepage", path: "/" },
  { name: "Profile page", path: "/profile" },
];

describe("Accessibility - ARC Portal", () => {
  pages.forEach(({ name, path }) => {
    it(`should have no critical or serious accessibility violations on ${name}`, () => {
      cy.visit(path);
      cy.injectAxe();
      cy.checkA11y(undefined, {
        includedImpacts: ["critical", "serious"],
      });
    });
  });
});
