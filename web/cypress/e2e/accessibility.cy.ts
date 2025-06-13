import "cypress-axe";

const pages = [
  { name: "Homepage", path: "/" },
  { name: "Profile page", path: "/profile" },
  { name: "Studies page", path: "/studies" },
  { name: "Assets page", path: "/assets" },
  { name: "Projects page", path: "/projects" },
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
