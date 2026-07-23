beforeEach(() => {
  cy.clearCookies();
  cy.clearLocalStorage();
});

describe(`Homepage Tests`, () => {
  describe("Unauthenticated content", () => {
    it("shows the ARC portal phrase on the homepage", () => {
      cy.visit("/");
      cy.get("h1").should("be.visible");
    });
  });

  describe("Authenticated content", () => {
    it("can be logged into as a base user", () => {
      cy.loginAsBase();
      cy.mockAuthAsBaseUser();

      cy.visit("/");
      cy.waitForAuth();
      cy.contains("Your Tasks").should("exist");
    });

    it("can be logged into as an admin and encouraged to complete profile", () => {
      cy.loginAsAdmin();

      cy.mockAuthAsAdminBase();

      cy.visit("/");
      cy.waitForAuth();
      cy.contains("Your Tasks").should("exist");
    });
  });

  describe("User tasks", () => {
    beforeEach(() => {
      cy.loginAsBase();
      cy.visit("/");
    });

    it("prompts to complete tasks profile is not complete", () => {
      cy.mockNotifications([{ title: "complete your profile", kind: "complete-profile" }]);

      // Mock auth as approved researcher (complete profile)
      cy.mockAuthAsBaseStaffApprovedResearcher();

      cy.visit("/");
      cy.waitForAuth();
      cy.wait("@getNotifications");

      cy.contains("Complete Your Profile Setup").should("be.visible");
    });

    it("shows tasks complete when profile is complete", () => {
      cy.mockNotifications([]);

      // Mock auth as approved researcher (complete profile)
      cy.mockAuthAsBaseStaffApprovedResearcher();

      cy.visit("/");
      cy.waitForAuth();
      cy.wait("@getNotifications");

      cy.contains("You have completed all your tasks").should("be.visible");
    });

    it("points to studies page for admin Approved Researcher", () => {
      cy.mockNotifications([{ title: "complete your profile", kind: "complete-profile" }]);

      cy.loginAsAdmin();
      cy.mockProfileChosenName("Tom Young");
      cy.mockAuthAsIGOpsStaffApprovedResearcher();

      cy.visit("/");
      cy.waitForAuth();
      cy.wait("@getNotifications");

      cy.contains("Studies").should("be.visible");
    });
  });

  describe("log out", () => {
    it("can log out", () => {
      cy.loginAsBase();
      cy.visit("/");
      cy.contains("Log out").click();
      cy.contains("Log out").should("not.exist");
    });
  });
});
