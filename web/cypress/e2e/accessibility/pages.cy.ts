import "cypress-axe";

const pages = [
  { name: "Homepage", path: "/" },
  { name: "Profile page", path: "/profile" },
  { name: "Studies page", path: "/studies" },
  { name: "Assets page", path: "/assets" },
  { name: "Projects page", path: "/projects" },
  { name: "People page", path: "/people" },
];

describe("Accessibility - ARC Portal", () => {
  describe("Unauthenticated content", () => {
    pages.forEach(({ name, path }) => {
      it(`should have no critical accessibility violations on ${name} (login fallback)`, () => {
        cy.visit(path);
        cy.get("header").should("be.visible"); // wait for page layout to load
        cy.injectAxe();
        cy.checkA11y(undefined, {
          includedImpacts: ["critical", "serious"],
        });
      });
    });
  });

  describe("Base user content", () => {
    beforeEach(() => {
      cy.loginAsBase();
    });

    pages.forEach(({ name, path }) => {
      it(`should have no critical accessibility violations on ${name} (base user)`, () => {
        cy.visit(path);
        cy.get("header").should("be.visible"); // wait for page layout to load
        cy.injectAxe();
        cy.checkA11y(undefined, {
          includedImpacts: ["critical", "serious"],
        });
      });
    });
  });

  describe("Admin user content", () => {
    beforeEach(() => {
      cy.loginAsAdmin();
    });

    pages.forEach(({ name, path }) => {
      it(`should have no critical accessibility violations on ${name} (admin user)`, () => {
        cy.visit(path);
        cy.get("header").should("be.visible"); // wait for page layout to load
        cy.injectAxe();
        cy.checkA11y(undefined, {
          includedImpacts: ["critical", "serious"],
        });
      });
    });
  });
});
