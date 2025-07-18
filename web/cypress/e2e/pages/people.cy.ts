beforeEach(() => {
  cy.clearCookies();
  cy.clearLocalStorage();
});

describe(`People page content`, () => {
  it("should show nothing to base role", () => {
    cy.loginAsBase();
    cy.mockAuthAsBaseUser();
    cy.visit("/people");
    cy.waitForAuth();

    cy.contains("You do not have permission to view this page").should("be.visible");
  });

  it("should show content for base approved researcher", () => {
    cy.loginAsBase();
    cy.mockAuthAsBaseApprovedResearcher();
    cy.visit("/people");
    cy.waitForAuth();

    cy.contains("You do not have permission to view this page").should("not.exist");
    cy.contains("Approved Researcher").should("be.visible");
  });

  it("should show content for admin", () => {
    cy.loginAsAdmin();
    cy.visit("/people");

    cy.contains("You do not have permission to view this page").should("not.exist");
    cy.get("table").contains("User").should("be.visible");
    cy.contains(Cypress.env("botAdminUsername")).should("be.visible");
  });
});

describe("Import approved researchers", () => {
  it("should not be uploadable by a base user", () => {
    cy.loginAsBase();
    cy.request({
      method: "POST",
      url: "/web/api/v0/users/approved-researchers/import/csv",
      body: "some-bytes",
      failOnStatusCode: false,
    })
      .its("status")
      .should("equal", 403);
  });

  it("should be uploadable by a admin user", () => {
    cy.loginAsAdmin();
    cy.visit("/people");
    const username = "laura@example.com";
    const filename = "tmp_approved_researchers.csv";
    cy.writeFile(filename, `${username},true,2025-07-01`);
    cy.get("input[type=file]").selectFile(filename, { force: true });
    cy.visit("/people");
    cy.get("table").contains(username).should("be.visible");
  });
});
