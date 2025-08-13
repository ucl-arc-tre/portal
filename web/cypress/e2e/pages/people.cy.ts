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

  it("should not show content for base approved researcher", () => {
    cy.loginAsBase();
    cy.mockAuthAsBaseApprovedResearcher();
    cy.visit("/people");
    cy.waitForAuth();

    cy.contains("You do not have permission to view this page").should("be.visible");
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

  it("should be uploadable by an admin user", () => {
    const username = "laura@example.com";
    const filename = "tmp_approved_researchers.csv";
    cy.writeFile(filename, `${username},true,2025-07-01`);

    cy.loginAsAdmin();
    cy.visit("/people");
    cy.get("[data-cy='approved-researcher-import']").click();
    cy.get("input[type=file]").selectFile(filename, { force: true });
    cy.visit("/people");
    cy.get("table").contains(username).should("be.visible");
  });
});

describe("Invite externals", () => {
  it("should not be visible to a base user", () => {
    cy.loginAsBase();
    cy.visit("/people");
    cy.get("[data-cy='show-invite-input']").should("not.exist");
  });

  it("should not be visible to a an approved researcher who is not staff", () => {
    cy.loginAsBase();
    cy.mockAuthAsBaseNonStaffApprovedResearcher();
    cy.visit("/people");
    cy.get("[data-cy='show-invite-input']").should("not.exist");
  });

  it("should be visable to & usable by an admin user", () => {
    cy.loginAsAdmin();
    cy.visit("/people");
    cy.mockInviteExternalResearcher("hello@example.com");

    cy.get("[data-cy='show-invite-input']").should("be.visible").click();

    cy.get("input[name='email']").should("be.visible").type("hello@example.com");
    cy.get("[data-cy='send-invite']").should("be.visible").click();

    cy.get("input[name='email']").should("not.have.value", "hello@example.com");
  });

  it("should be visable to & usable by an approved researcher who is staff", () => {
    cy.loginAsBase();
    cy.mockAuthAsBaseInformationAssetOwner();
    cy.visit("/people");
    cy.mockInviteExternalResearcher("hello@example.com");

    cy.get("[data-cy='show-invite-input']").should("be.visible").click();

    cy.get("input[name='email']").should("be.visible").type("hello@example.com");
    cy.get("[data-cy='send-invite']").should("be.visible").click();

    cy.get("input[name='email']").should("not.have.value", "hello@example.com");
  });
});
