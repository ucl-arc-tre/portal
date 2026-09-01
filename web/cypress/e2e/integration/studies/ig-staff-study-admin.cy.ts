beforeEach(() => {
  cy.clearCookies();
  cy.clearLocalStorage();
});

describe("IG staff as a study admin end-to-end", () => {
  const studyTitle = `study-${Date.now()}`;
  const assetTitle = `asset-${Date.now()}`;

  it("staff should become an approved researcher", () => {
    cy.loginAsStaff();
    cy.becomeApprovedResearcher();
  });

  it("ig ops staff should become an approved researcher", () => {
    cy.loginAsIGOps();
    cy.becomeApprovedResearcher();
  });

  it("ig admin should become an approved researcher", () => {
    cy.loginAsIGAdmin();
    cy.becomeApprovedResearcher();
  });

  it("staff should create a study, complete setup, and add ig ops staff as an admin", () => {
    cy.loginAsStaff();

    cy.visit("/studies");
    cy.get('[data-cy="create-study-button"]').click();
    cy.get('[name="title"]').type(studyTitle);
    cy.get('[name="description"]').type("Test study");
    cy.get('[name="dataControllerOrganisation"]').type("UCL");
    cy.get('[data-cy="next"]').click();
    cy.get('[data-cy="next"]').click();
    cy.get("button[type='submit']").click();

    cy.contains(studyTitle).click();
    cy.get('[data-cy="agreement-agree"]').click();

    cy.get('[data-cy="add-asset-button"]').click({ force: true });
    cy.get("input#title").type(assetTitle);
    cy.get('[name="description"]').type("Unknown");
    cy.get('[name="classification_impact"]').select("public");
    cy.get('[name="format"]').select("electronic");
    cy.get("input[name='has_expiry_date'][value='true']").check({ force: true });
    cy.get('[name="expires_at"]').type("2022-01-01");
    cy.get('[data-cy="create-asset-form"] input[value="arc_tre"]').check();
    cy.get("input[name='requires_contract'][value='false']").check({ force: true });
    cy.get("input[name='has_dspt'][value='false']").check({ force: true });
    cy.get("input[name='stored_outside_uk_eea'][value='false']").check({ force: true });
    cy.get('[name="status"]').select("active");
    cy.get("button[type='submit']").click();

    cy.contains("Incomplete").should("be.visible");

    cy.env(["botIGUsername"]).then(({ botIGUsername }) => {
      const additionalAdminUsername = botIGUsername.split("@")[0];

      cy.get('[data-cy="edit-study-button"]').click();
      cy.get('[data-cy="user-lookup"]').type(additionalAdminUsername);
      cy.get('button[data-cy="user-lookup-submit"]').click();
      cy.get('[data-cy="add-user-to-selection"]').first().click();
      cy.get('[data-cy="next"]').click();
      cy.get('[data-cy="next"]').click();
      cy.get("button[type='submit']").contains("Update Study").click();
      cy.contains("Update Study").should("not.exist");

      cy.contains("The following administrators have not yet agreed to the study agreement:").should("be.visible");
      cy.contains(additionalAdminUsername).should("be.visible");
    });
  });

  it("ig staff admin must sign the study administrator agreement before doing anything else", () => {
    cy.loginAsIGOps();

    cy.visit("/studies");
    cy.get('button[data-cy="all"]').click();
    cy.get('[data-testid="ucl-uikit-search"]').type(studyTitle);
    cy.get('[data-testid="ucl-uikit-search-search-btn"]').click();
    cy.contains(studyTitle).click();

    cy.contains("Study Administrator Agreement").should("be.visible");
    cy.get('[data-cy="study-approve-button"]').should("not.exist");
    cy.get('[data-cy="study-ready-for-review-button"]').should("not.exist");

    cy.get('[data-cy="agreement-agree"]').click();
    cy.get('[data-cy="study-details"]').should("be.visible");
  });

  it("ig staff admin can submit the study for review but cannot review or approve it", () => {
    cy.loginAsIGOps();

    cy.visit("/studies");
    cy.get('button[data-cy="all"]').click();
    cy.get('[data-testid="ucl-uikit-search"]').type(studyTitle);
    cy.get('[data-testid="ucl-uikit-search-search-btn"]').click();
    cy.contains(studyTitle).click();

    cy.get('[data-cy="study-ready-for-review-button"]').click();
    cy.get('[data-cy="study-affirmation-confirm-checkbox"]').check();
    cy.get('[data-cy="study-affirmation-confirm-button"]').click();

    cy.contains("Submitted for Review").should("be.visible");
    cy.contains("You cannot review or approve a study you own or are an administrator of").should("be.visible");
    cy.get('[data-cy="study-approve-button"]').should("not.exist");
  });

  it("ig admin who is not the owner or an admin can approve the study", () => {
    cy.loginAsIGAdmin();

    cy.visit("/studies");
    cy.get('button[data-cy="all"]').click();
    cy.get('[data-testid="ucl-uikit-search"]').type(studyTitle);
    cy.get('[data-testid="ucl-uikit-search-search-btn"]').click();
    cy.contains(studyTitle).click();

    cy.get('[data-cy="study-approve-button"]').click();
    cy.contains("Approved").should("be.visible");
  });
});
