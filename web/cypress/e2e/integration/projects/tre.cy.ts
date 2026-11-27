beforeEach(() => {
  cy.clearCookies();
  cy.clearLocalStorage();
});

describe("TRE project creation end-to-end", () => {
  const studyTitle = `study-tre-project-${Date.now()}`;
  const assetTitle = `asset-tre-project-${Date.now()}`;
  let projectTitle = `tre${Date.now()}`.substring(0, 14);

  const tokenName = `test-tre-${Date.now()}`;
  let tokenValue = "";

  it("staff member should create a study", () => {
    cy.loginAsStaff();
    cy.becomeApprovedResearcher();
    cy.createStudyForReview(studyTitle, assetTitle);
  });

  it("ig ops staff should approve the study", () => {
    cy.loginAsIGOps();
    cy.becomeApprovedResearcher();

    cy.visit("/studies");
    cy.get('button[data-cy="all"]').click();
    cy.get('[data-testid="ucl-uikit-search"]').type(`title:${studyTitle}`);
    cy.get('[data-testid="ucl-uikit-search-search-btn"]').click();
    cy.contains(studyTitle).click();
    cy.get('[data-cy="study-approve-button"]').click();
  });

  it("staff member should create a project", () => {
    cy.loginAsStaff();

    cy.visit("/projects");
    cy.get('[data-cy="create-project-button"]').click();
    cy.get('[name="studyId"]').select(studyTitle);
    cy.get('[name="environmentId"]').select("ARC Trusted Research Environment (Tier 3)");
    cy.get('[name="name"]').type(projectTitle);
    cy.get('[data-cy="next-form-page-button"]').click();

    cy.env(["botStaffUsername"]).then(({ botStaffUsername }) => {
      cy.get('[data-cy="user-lookup"]').type(botStaffUsername);
    });
    cy.get('[data-cy="user-lookup-submit"]').click();
    cy.env(["botStaffUsername"]).then(({ botStaffUsername }) => {
      cy.get(`div[data-id="${botStaffUsername}"] [data-testid="ucl-uikit-button"]`).click();
    });
    cy.get('[data-cy="tre-member-role-dropdown"]').select("desktop_user");
    cy.get('[data-cy="tre.requiresHPCDesktops-true"]').click({ force: true });
    cy.get('[name="hpcInstances"]').select("t3a.large");
    cy.get('[name="tre.numRequiredEgressApprovals"]').check("1", { force: true });
    cy.get('[name="tre.externalEncryptionEnabled"]').check("false", { force: true });

    // Add an airlock whitelist entry
    cy.get('[name="tre.airlockExternalDataEnabled"]').check("true", { force: true });
    cy.contains("button", "Add IP / Domain").click();
    cy.get('[name="tre.airlockOutboundWhitelist.0.value"]').type("192.168.1.1", { force: true });

    cy.get('[name="tre.airlockSSHWhitelistEnabled"]').check("false", { force: true });

    cy.get('[data-cy="submit-project-button"]').click();
  });

  it("staff member should be able to see the project once created", () => {
    cy.loginAsStaff();

    cy.visit("/projects");
    cy.contains(projectTitle).should("exist");
    cy.contains(projectTitle).click();

    // The whitelisted IP should be displayed on the manage page
    cy.contains("192.168.1.1").should("exist");

    cy.get('[data-cy="mark-project-ready-for-review-button"]').click();
  });

  it("study's projects tab should show the created project", () => {
    cy.loginAsStaff();

    cy.visit("/studies");
    cy.contains(studyTitle).click();
    cy.get('button[data-cy="projects"]').click();

    cy.contains(projectTitle).should("be.visible");
  });

  it("tre ops staff should be able to search for and approve the project", () => {
    cy.loginAsTREOps();
    cy.becomeApprovedResearcher();
    cy.visit("/projects");

    cy.get('[data-testid="ucl-uikit-search"]').type(projectTitle);
    cy.get('[data-testid="ucl-uikit-search-search-btn"]').click();
    cy.contains(projectTitle).click();
    cy.get(`[data-cy="accept-project-button"]`).click();
  });

  it("trepos API should be able to get an api token", () => {
    cy.loginAsTREOps();

    cy.visit("/profile");
    cy.get('[data-cy="create-token-button"]').click();
    cy.get('[data-cy="create-token-form"]').should("be.visible");
    cy.get('[name="name"]').type(tokenName);
    cy.get('button[aria-disabled="false"][type="submit"]').click();

    cy.get('[data-cy="token-value"]').then(($div) => {
      tokenValue = $div.text();
    });
  });

  it("tre API should be able to mark the project as deployed", () => {
    if (!tokenValue) {
      throw new Error("unset token");
    }

    const headers = {
      authorization: `Bearer ${tokenValue}`,
    };

    cy.request({
      method: "POST",
      url: `/tre/api/v0/projects/${projectTitle}`,
      headers: headers,
      body: {
        status: "deployed",
        deployed_version_updated_at: new Date().toISOString(),
      },
    }).should("be.ok");
  });

  it("project should now show as deployed", () => {
    cy.loginAsTREOps();
    cy.visit("/projects");

    cy.contains(projectTitle).click();
    cy.get('[data-cy="status-badge"]').contains("deployed").should("exist");
  });
});
