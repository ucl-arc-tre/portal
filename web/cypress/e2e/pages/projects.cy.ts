beforeEach(() => {
  cy.clearCookies();
  cy.clearLocalStorage();
});

describe("Projects page content", () => {
  it("should show 'Complete your profile' message for non-approved researchers", () => {
    cy.loginAsBase();
    cy.mockAuthAsBaseUser();
    cy.visit("/projects");
    cy.waitForAuth();

    cy.contains("Complete your profile").should("be.visible");
  });

  it("should show 'Go to Studies' button when approved staff researcher has no approved studies", () => {
    cy.loginAsStaff();
    cy.mockAuthAsBaseStaffApprovedResearcher();
    cy.mockProjectsEmpty();
    cy.mockStudiesEmpty();

    cy.visit("/projects");
    cy.waitForAuth();
    cy.wait("@getProjectsEmpty");
    cy.wait("@getStudiesEmpty");

    cy.contains("You don't have any approved studies").should("be.visible");
    cy.contains("Go to Studies").should("be.visible");
  });

  it("should show 'Create Your First Project' button when approved staff researcher has approved studies but no projects", () => {
    cy.loginAsStaff();
    cy.mockAuthAsBaseStaffApprovedResearcher();
    cy.mockProjectsEmpty();
    cy.mockStudiesWithApprovedStudy();

    cy.visit("/projects");
    cy.waitForAuth();
    cy.wait("@getProjectsEmpty");
    cy.wait("@getStudiesWithApproved");

    cy.contains("You haven't created any projects yet").should("be.visible");
    cy.contains("Create Your First Project").should("be.visible");
  });

  it("should show message for non-staff approved researchers with no projects", () => {
    cy.loginAsBase();
    cy.mockAuthAsBaseNonStaffApprovedResearcher();
    cy.mockProjectsEmpty();
    cy.mockStudiesWithApprovedStudy();

    cy.visit("/projects");
    cy.waitForAuth();
    cy.wait("@getProjectsEmpty");
    cy.wait("@getStudiesWithApproved");

    cy.contains("You haven't been added to any projects yet").should("be.visible");
    cy.contains("Create Your First Project").should("not.exist");
  });
});

describe("Project creation button behavior", () => {
  it("should open project creation form when staff user clicks create button", () => {
    cy.loginAsStaff();
    cy.mockAuthAsBaseStaffApprovedResearcher();
    cy.mockProjectsEmpty();
    cy.mockStudiesWithApprovedStudy();

    cy.visit("/projects");
    cy.waitForAuth();
    cy.wait("@getProjectsEmpty");
    cy.wait("@getStudiesWithApproved");

    cy.contains("Create Your First Project").should("be.visible").click();
    cy.contains("Create New Project").should("be.visible");
  });
});

describe("Project form validation", () => {
  beforeEach(() => {
    cy.loginAsStaff();
    cy.mockAuthAsBaseStaffApprovedResearcher();
    cy.mockProjectsEmpty();
    cy.mockStudiesWithApprovedStudy();
    cy.mockEnvironmentsTre();
    cy.mockInformationAssetsEmpty(); // Mock assets fetching for the selected study

    cy.visit("/projects");
    cy.waitForAuth();
    cy.wait("@getProjectsEmpty");
    cy.wait("@getStudiesWithApproved");

    // Open the form
    cy.contains("Create Your First Project").click();
    cy.wait("@getEnvironments");
  });

  it("should require required inputs to be selected", () => {
    // Try to navigate without selecting anything
    cy.get("button").contains("Next").click();
    cy.contains("Please select a study").should("exist");
    cy.contains("Please select an environment").should("exist");
    cy.contains("Project name is required").should("exist");
  });

  it("should go to the next step when required inputs are selected", () => {
    // Select all required fields
    cy.get("select#studyId").select("Approved Test Study");
    cy.get("select#environmentId").select("ARC Trusted Research Environment (Tier 3)");

    cy.contains("label", "Project Name").parent().find("input").type("myproject123");

    cy.get("button").contains("Next").click();

    // Should not show any validation errors
    cy.contains("Please select a study").should("not.exist");
    cy.contains("Please select an environment").should("not.exist");
    cy.contains("Project name is required").should("not.exist");

    // Verify we moved to step 2 (members section visible)
    cy.contains("Additional Approved Researchers (optional)").should("be.visible");
  });

  it("should reject project names that violate TRE naming rules", () => {
    // Select study and environment
    cy.get("select#studyId").select("Approved Test Study");
    cy.get("select#environmentId").select("ARC Trusted Research Environment (Tier 3)");

    // uppercase letters should not be allowed
    cy.contains("label", "Project Name").parent().find("input").type("MyProject");
    cy.get("button").contains("Next").click();
    cy.contains("Must be 4-14 characters long and contain only lowercase letters and numbers").should("exist");

    // hyphens should not be allowed
    cy.contains("label", "Project Name").parent().find("input").clear().type("my-project");
    cy.get("button").contains("Next").click();
    cy.contains("Must be 4-14 characters long and contain only lowercase letters and numbers").should("exist");

    // special characters should not be allowed
    cy.contains("label", "Project Name").parent().find("input").clear().type("my_project");
    cy.get("button").contains("Next").click();
    cy.contains("Must be 4-14 characters long and contain only lowercase letters and numbers").should("exist");
  });
});
