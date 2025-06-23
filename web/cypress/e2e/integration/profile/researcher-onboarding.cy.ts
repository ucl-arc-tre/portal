beforeEach(() => {
  cy.clearCookies();
  cy.clearLocalStorage();
});

describe("Full Researcher Onboarding Integration", () => {
  it("admin user can agree to approved researcher agreement", () => {
    cy.loginAsAdmin();
    cy.visit("/profile/approved-researcher");

    cy.contains("Loading...").should("not.exist");
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

    cy.contains("Loading...").should("not.exist");
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

describe("Chosen Name Integration", () => {
  beforeEach(() => {
    cy.loginAsBase();
    cy.clearChosenName();
    cy.visit("/");
  });

  const chosenName = (Cypress.env("chosenName") as string) || "Test Chosen Name";

  it("can set and persist chosen name", () => {
    cy.get("dialog[data-cy='chosenName']").find("input").type(chosenName);
    cy.get("dialog[data-cy='chosenName']").find("button").click();
    cy.reload();
    cy.contains(chosenName).should("be.visible");
    cy.clearChosenName();
  });
});

describe("NHSD Training Certificate Upload Integration", () => {
  beforeEach(() => {
    cy.loginAsBase();
    cy.clearChosenName();
  });

  const submitFile = function (filePath: string) {
    cy.visit("/profile/approved-researcher");
    cy.contains("Loading...").should("not.exist");
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
    submitFile("cypress/fixtures/invalid_nhsd_certificate.pdf");
    cy.contains("Certificate was not valid").should("be.visible");
  });

  it("valid certificate for wrong user is invalid", function () {
    setChosenName("Bob smith");
    submitFile("cypress/fixtures/valid_nhsd_certificate.pdf");
    cy.contains("Certificate was not valid").should("be.visible");
  });

  it("valid certificate for correct user is valid", function () {
    setChosenName("Tom Young");
    submitFile("cypress/fixtures/valid_nhsd_certificate.pdf");
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
