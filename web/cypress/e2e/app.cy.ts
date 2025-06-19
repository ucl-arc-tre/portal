beforeEach(() => {
  cy.clearCookies();
  cy.clearLocalStorage();
});

describe("People page content", () => {
  it("should show nothing to base role", () => {
    cy.loginAsBase();
    cy.visit("/people");

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

describe("ARC Portal UI unauthenticated", () => {
  it("shows the ARC portal phrase on the homepage", () => {
    cy.visit("/");

    cy.get("h1").should("be.visible");
    cy.contains("fibble").should("not.exist");
  });
});

describe("ARC Portal UI authenticated", () => {
  it("can be logged into as an admin", () => {
    cy.loginAsBase();

    cy.visit("/");
    cy.contains("Username").should("exist");
  });

  it("admin user can agree to approved researcher agreement", () => {
    cy.loginAsAdmin();
    cy.visit("/profile/approved-researcher");

    cy.get("[data-cy='approved-researcher-agreement']"); // wait for load

    cy.get("body").then((body) => {
      if (body.find("[data-cy='approved-researcher-agreement-text']").length > 0) {
        cy.get("[data-cy='approved-researcher-agreement-text']").should("be.visible");
        cy.get("input[name='agreed'][type='checkbox']").check();
        cy.get("[data-cy='approved-researcher-agreement-agree']").click();
      }
    });

    cy.contains("Agreement confirmed").should("be.visible");
  });

  it("base user can agree to approved researcher agreement", () => {
    cy.loginAsBase();
    cy.visit("/profile/approved-researcher");

    cy.get("[data-cy='approved-researcher-agreement']"); // wait for load

    cy.get("body").then((body) => {
      if (body.find("[data-cy='approved-researcher-agreement-text']").length > 0) {
        cy.get("[data-cy='approved-researcher-agreement-text']").should("be.visible");
        cy.get("input[name='agreed'][type='checkbox']").check();
        cy.get("[data-cy='approved-researcher-agreement-agree']").click();
      }
    });

    cy.contains("Agreement confirmed").should("be.visible");
  });
});

describe("Setting chosen name for user", () => {
  beforeEach(() => {
    cy.loginAsBase();
    cy.clearChosenName();
    cy.visit("/");
  });

  const chosenName = (Cypress.env("chosenName") as string) || "Test Chosen Name";

  it("prompts user to set chosen name", () => {
    cy.get("dialog[data-cy='chosenName']").should("be.visible");
  });

  it("can set chosen name", () => {
    cy.get("dialog[data-cy='chosenName']").find("input").type(chosenName);
    cy.get("dialog[data-cy='chosenName']").find("button").click();
    cy.reload();
    cy.contains(chosenName).should("be.visible");
    cy.clearChosenName();
  });

  it("can't set invalid name", () => {
    cy.get("dialog[data-cy='chosenName']").within(() => {
      cy.get("input").type("123533");
      cy.get("button").click();
      cy.get("[data-testid='ucl-uikit-alert']").should("be.visible").and("contain", "Please enter a valid name");
    });

    // Make sure the dialog is still open
    cy.get("dialog[data-cy='chosenName']").should("be.visible");
  });
});

describe("Uploading a NHSD training certificate", () => {
  beforeEach(() => {
    cy.loginAsBase();
    cy.clearChosenName();
  });

  const submitFile = function (filePath: string) {
    cy.visit("/profile/approved-researcher");
    cy.get("input[type=file]").selectFile(filePath);
    cy.get("[data-cy='training-certificate-sumbit']").click();
  };

  const setChosenName = function (name: string) {
    cy.visit("/");
    cy.get("dialog[data-cy='chosenName']").find("input").type(name);
    cy.get("dialog[data-cy='chosenName']").find("button").click();
  };

  it("invalid certificate is not valid", function () {
    setChosenName("Tom Young");
    submitFile("cypress/e2e/testdata/invalid_nhsd_certificate.pdf");
    cy.contains("Certificate was not valid").should("be.visible");
  });

  it("valid certificate for wrong user is invalid", function () {
    setChosenName("Bob smith");
    submitFile("cypress/e2e/testdata/valid_nhsd_certificate.pdf");
    cy.contains("Certificate was not valid").should("be.visible");
  });

  it("valid certificate for correct user is valid", function () {
    setChosenName("Tom Young");
    submitFile("cypress/e2e/testdata/valid_nhsd_certificate.pdf");
    cy.contains("Valid training").should("be.visible");
    // If needed agree to the approved resarcher agreement
    cy.get("body").then((body) => {
      if (body.find("[data-cy='approved-researcher-agreement-text']").length > 0) {
        cy.get("input[name='agreed'][type='checkbox']").check();
        cy.get("[data-cy='approved-researcher-agreement-agree']").click();
      }
    });
    cy.visit("/");
    cy.contains("approved-researcher").should("be.visible"); // todo: move to querying /profile
  });
});
