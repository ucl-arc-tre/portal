beforeEach(() => {
  cy.clearCookies();
  cy.clearLocalStorage();
});

describe("Study creation end-to-end", () => {
  const studyTitle = `study-${Date.now()}`;

  it("staff should become an approved researcher", () => {
    cy.loginAsStaff();
    becomeApprovedResearcher();
  });

  it("ig ops staff should become an approved researcher", () => {
    cy.loginAsIGOps();
    becomeApprovedResearcher();
  });

  it("staff should successfully create a study", () => {
    cy.loginAsStaff();

    // Visit page and wait for initial load
    cy.visit("/studies");

    cy.get('[data-cy="create-study-button"]').click();
    cy.get('[name="title"]').type(studyTitle);
    cy.get('[name="dataControllerOrganisation"]').type("UCL");
    cy.get('[data-cy="next"]').click();
    cy.get('[data-cy="next"]').click();
    cy.get("button[type='submit']").click();

    cy.contains(studyTitle)
      .parent()
      .parent()
      .within(() => {
        cy.get('[data-cy="manage-study-button"]').click();
      });
    cy.get('[data-cy="agreement-agree"]').click();

    const additionalAdminUsernamePrefix = "portal-e2e-admin";

    cy.get('[data-cy="edit-study-button"]').click();
    cy.get('[data-cy="add-study-admin-button"').click();
    cy.get('[name="additionalStudyAdminUsernames.0.value"]').type(additionalAdminUsernamePrefix);
    cy.get('[data-cy="next"]').click();
    cy.get('[data-cy="next"]').click();
    cy.get("button[type='submit']").click();

    cy.contains("Incomplete").should("be.visible"); // status is incomplete

    cy.get('[data-cy="add-asset-button"]').click({ force: true });
    cy.contains("Create New Asset").should("be.visible");
    cy.get('[name="title"]').first().type("Thing");
    cy.get('[name="description"]').type("Unknown");
    cy.get('[name="classification_impact"]').select("public");
    cy.get('[name="protection"]').select("anonymisation");
    cy.get('[name="legal_basis"]').select("consent");
    cy.get('[name="format"]').select("electronic");
    cy.get('[name="expires_at"]').type("2022-01-01");
    cy.get('[data-cy="create-asset-form"] input[value="arc_tre"]').check();
    cy.get("input[name='requires_contract'][value='false']").check({ force: true });
    cy.get("input[name='has_dspt'][value='false']").check({ force: true });
    cy.get("input[name='stored_outside_uk_eea'][value='false']").check({ force: true });
    cy.get('[name="status"]').select("active");
    cy.get("button[type='submit']").click();

    cy.contains("Manage Study").should("be.visible");
    cy.get('[data-cy="study-admins-agreement-prompt"]').contains(additionalAdminUsernamePrefix).should("be.visible");

    // remove added study admin
    cy.get('[data-cy="edit-study-button"]').click();
    cy.get('[data-cy="remove-study-admin-button"]').click();
    cy.get('[data-cy="next"]').click();
    cy.get('[data-cy="next"]').click();
    cy.get("button[type='submit']").click();

    // mark as ready for review
    cy.get('[data-cy="study-ready-for-review-button"]').click();
  });

  it("ig ops should see a study", () => {
    cy.loginAsIGOps();
    cy.visit("/studies");
    cy.get('[data-cy="all-studies-tab-button"]').click();
    cy.get('[data-cy="study-card"]').first().contains("View Study").click();
    cy.get('[data-cy="study-approve-button"]').click();
  });

  it("staff should see an approved study", () => {
    cy.loginAsStaff();

    cy.visit("/studies");
    cy.contains(studyTitle).parent().parent().get('[data-cy="status-badge"]').contains("Approved").should("exist");
  });
});

function becomeApprovedResearcher() {
  cy.visit("/profile");

  cy.contains("Profile Information").should("be.visible");

  cy.get("body").then(($body) => {
    if ($body.text().includes("Save Name")) {
      cy.get("[data-cy='chosen-name-form'] input").type("Tom Young");
      cy.get("[data-cy='chosen-name-form'] button[type='submit']").click();
    }
    if ($body.text().includes("You are reminded that the UCL Information Security Policy")) {
      cy.get("[data-cy='agreement-agree']").click();
    }
    if (!$body.text().includes("Verify another certificate")) {
      cy.get("input[type=file]").selectFile("cypress/fixtures/valid_nhsd_certificate.pdf");
      cy.get("[data-cy='training-certificate-sumbit']").click();
    }
  });
}
