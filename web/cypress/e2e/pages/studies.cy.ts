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

    cy.contains("No Studies").should("be.visible");
  });

  it("should show content for base approved researcher", () => {
    cy.loginAsBase();
    cy.mockAuthAsBaseApprovedResearcher();
    cy.visit("/studies");
    cy.waitForAuth();

    cy.contains("No Studies").should("not.exist");
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

  it("owner set to user & can't be edited", () => {
    cy.fixture("auth-base-approved-researcher.json").then((data) => {
      const username = data.username;

      cy.contains("Create Study").should("be.visible").click();

      cy.get("input[name='owner']").should("have.attr", "readonly");
      cy.get("input[name='owner']").should("have.value", username);
    });
  });

  it("can't submit without filling in required fields", () => {
    cy.contains("Create Study").should("be.visible").click();

    // click through form
    cy.get("[data-cy='next']").click();
    cy.get("[data-cy='next']").click();
    cy.get("button[type='submit']").should("be.disabled");

    // go back to start of form and fill in the fields
    cy.get("[data-cy='back']").click();
    cy.get("[data-cy='back']").click();
    cy.get("input[name='shortStudyName']").type("Test Study");
    cy.get("input[name='controller']").type("Test Controller");

    // go to the end and submit
    cy.get("[data-cy='next']").click();
    cy.get("[data-cy='next']").click();
    cy.get("button[type='submit']").should("not.be.disabled");
  });
});
