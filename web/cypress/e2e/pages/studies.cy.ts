beforeEach(() => {
  cy.clearCookies();
  cy.clearLocalStorage();
});

describe(`Studies page content`, () => {
  it("should show base role content", () => {
    cy.loginAsBase();
    cy.mockAuthAsBaseUser();
    cy.visit("/studies");
    cy.waitForAuth();

    cy.contains("This page is being built. Please check back soon for updates!").should("be.visible");
  });

  it("should show content for base approved researcher", () => {
    cy.loginAsBase();
    cy.mockAuthAsBaseApprovedResearcher();
    cy.visit("/studies");
    cy.waitForAuth();

    cy.contains("This page is being built. Please check back soon for updates!").should("not.exist");
    cy.contains("Your Studies").should("be.visible");
  });
});

describe("Approved researcher can create studies", () => {
  beforeEach(() => {
    cy.loginAsBase();
    cy.mockAuthAsBaseApprovedResearcher();
    cy.visit("/studies");
    cy.waitForAuth();
  });

  it("can bring up the form", () => {
    cy.contains("Create Study").should("be.visible").click();
    cy.get("[data-cy='create-study-form']").should("be.visible");
  });

  it("can't edit study owner", () => {
    cy.fixture("auth-base-approved-researcher.json").then((data) => {
      const username = data.username;

      cy.contains("Create Study").should("be.visible").click();

      cy.get("input[name='owner']").should("be.readonly").should("have.value", username);
    });
  });

  it("can't submit without filling in required fields", () => {
    cy.contains("Create Study").should("be.visible").click();
  });
});
