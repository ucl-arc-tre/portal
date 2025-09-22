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

    cy.contains("Complete your profile").should("be.visible");
  });

  it("should show content for base approved researcher", () => {
    cy.loginAsBase();
    cy.mockAuthAsBaseStaffApprovedResearcher();
    cy.visit("/studies");
    cy.waitForAuth();

    cy.contains("Create Your First Study").should("be.visible");
  });
});

describe("Approved researcher can create studies", () => {
  beforeEach(() => {
    cy.loginAsBase();
    cy.mockAuthAsBaseStaffApprovedResearcher();
    cy.visit("/studies");
    cy.waitForAuth();
  });

  it("can bring up the form", () => {
    cy.contains("Create Your First Study").should("be.visible").click();
    cy.get("[data-cy='create-study-form']").should("be.visible");
  });

  it("owner set to user & can't be edited", () => {
    cy.fixture("auth-base-approved-researcher.json").then((data) => {
      const username = data.username;

      cy.contains("Create Your First Study").should("be.visible").click();

      cy.get("input[name='owner']").should("have.attr", "readonly");
      cy.get("input[name='owner']").should("have.value", username);
    });
  });

  it("can't submit without filling in required fields", () => {
    cy.contains("Create Your First Study").should("be.visible").click();

    // click through form
    cy.get("[data-cy='next']").click();
    cy.get("[data-cy='next']").click();
    cy.get("button[type='submit']").should("be.disabled");

    // go back to start of form and fill in the fields
    cy.get("[data-cy='back']").click();
    cy.get("[data-cy='back']").click();
    cy.get("input[name='title']").type("Test Study");
    cy.get("input[name='dataControllerOrganisation']").type("UCL");

    // go to the end and submit
    cy.get("[data-cy='next']").click();
    cy.get("[data-cy='next']").click();
    cy.get("button[type='submit']").should("not.be.disabled");
  });
});

describe("Checking conditionally rendered fields", () => {
  beforeEach(() => {
    cy.loginAsBase();
    cy.mockAuthAsBaseStaffApprovedResearcher();
    cy.visit("/studies");
    cy.waitForAuth();
    cy.contains("Create Your First Study").click();
  });
  afterEach(() => {
    cy.get("[data-cy='close-dialog']").click();
  });

  it("sets DPO id to UCL's if UCL selected", () => {
    cy.get("input[name='dataControllerOrganisation']").type("UCL");

    cy.get("[data-cy='next']").click();
    cy.get("[data-cy='next']").click();

    cy.get("input[name='isDataProtectionOfficeRegistered']").check();
    cy.get("input[name='dataProtectionPrefix']")
      .should("have.value", "Z6364106")
      .should("have.attr", "readonly", "readonly");
  });

  it("allows DPO id to be set if not UCL", () => {
    cy.get("input[name='dataControllerOrganisation']").type("Other Organization");

    cy.get("[data-cy='next']").click();
    cy.get("[data-cy='next']").click();

    cy.get("input[name='isDataProtectionOfficeRegistered']").check();
    cy.get("input[name='dataProtectionPrefix']").should("not.have.attr", "readonly");
    cy.get("input[name='dataProtectionPrefix']").type("A12345678"); // pragma: allowlist secret
  });

  it("should show CAG ref when checked", () => {
    cy.get("[data-cy='next']").click();
    cy.get("input[name='involvesCag']").check();

    cy.get("input[name='cagReference']").should("be.visible");
  });

  it("should show IRAS ID when HRA is checked", () => {
    cy.get("[data-cy='next']").click();
    cy.get("input[name='involvesHraApproval']").check();

    cy.get("input[name='irasId']").should("be.visible");
  });

  it("should show NHS questions when checked", () => {
    cy.get("[data-cy='next']").click();
    cy.get("input[name='isNhsAssociated']").check();

    cy.get("input[name='involvesNhsEngland']").should("be.visible").check();
    cy.get("input[name='nhsEnglandReference']").should("be.visible");
    cy.get("input[name='involvesMnca']").should("be.visible");
    cy.get("input[name='requiresDspt']").should("be.visible");
  });
});

describe("Study creation end-to-end", () => {
  beforeEach(() => {
    cy.loginAsBase();
  });

  it("should successfully create a study and see it in the list", () => {
    cy.mockAuthAsBaseStaffApprovedResearcher();

    // Mock initial empty studies list
    cy.mockStudiesEmpty();

    // Visit page and wait for initial load
    cy.visit("/studies");
    cy.waitForAuth();
    cy.wait("@getStudiesEmpty");

    cy.contains("Create Your First Study").should("be.visible").click();

    // Fill in required fields
    cy.get("input[name='title']").type("My New Test Study");
    cy.get("input[name='dataControllerOrganisation']").type("UCL");

    // Navigate through form steps
    cy.get("[data-cy='next']").click();
    cy.get("[data-cy='next']").click();

    cy.mockStudyCreation();
    cy.mockStudiesWithNewStudy();

    cy.get("button[type='submit']").click();

    cy.waitForStudyCreation();
    cy.wait("@getStudiesWithNew");

    // Verify the form closes
    cy.get("[data-cy='create-study-form']").should("not.exist");

    // Verify the new study appears in the studies list
    cy.contains("My New Test Study").should("be.visible");
    cy.contains("Manage Study").should("be.visible");
  });
});
