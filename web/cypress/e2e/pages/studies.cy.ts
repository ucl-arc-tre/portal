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
    cy.get("input[name='studyName']").type("Test Study");
    cy.get("select[name='controller']").select("UCL");

    // go to the end and submit
    cy.get("[data-cy='next']").click();
    cy.get("[data-cy='next']").click();
    cy.get("button[type='submit']").should("not.be.disabled");
  });
});

describe("Checking conditionally rendered fields", () => {
  beforeEach(() => {
    cy.loginAsBase();
    cy.mockAuthAsBaseApprovedResearcher();
    cy.visit("/studies");
    cy.waitForAuth();
    cy.contains("Create Study").click();
  });

  it("shows controller text input if not UCL", () => {
    cy.get("select[name='controller']").select("Other");
    cy.get("input[name='controllerOther']").type("Test Controller");
  });

  it("sets DPO id to UCL's if UCL selected", () => {
    cy.get("select[name='controller']").select("UCL");

    cy.get("[data-cy='next']").click();
    cy.get("[data-cy='next']").click();

    cy.get("input[name='dataProtection']").check();
    cy.get("input[name='dataProtectionPrefix']").should("have.value", "Z6364106").should("have.attr", "readonly");
  });

  it("allows DPO id to be set if not UCL", () => {
    cy.get("select[name='controller']").select("Other");

    cy.get("[data-cy='next']").click();
    cy.get("[data-cy='next']").click();

    cy.get("input[name='dataProtection']").check();
    cy.get("input[name='dataProtectionPrefix']").should("not.have.attr", "readonly").type("A12345678"); // pragma: allowlist secret
  });

  it("should show CAG ref when checked", () => {
    cy.get("[data-cy='next']").click();
    cy.get("input[name='cag']").check();

    cy.get("input[name='cagRef']").should("be.visible");
  });

  it("should show IRAS ID when HRA is checked", () => {
    cy.get("[data-cy='next']").click();
    cy.get("input[name='hra']").check();

    cy.get("input[name='irasId']").should("be.visible");
  });

  it("should show NHS questions when checked", () => {
    cy.get("[data-cy='next']").click();
    cy.get("input[name='nhs']").check();

    cy.get("input[name='nhsEngland']").should("be.visible").check();
    cy.get("input[name='nhsEnglandRef']").should("be.visible");
    cy.get("input[name='mnca']").should("be.visible");
    cy.get("input[name='dspt']").should("be.visible");
  });
});
