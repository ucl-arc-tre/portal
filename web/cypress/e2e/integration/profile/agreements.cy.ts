describe("Profile agreements", () => {
  it("shows the signed agreement text when expanded", () => {
    cy.loginAsStaff();
    cy.becomeApprovedResearcher();

    cy.visit("/profile");
    cy.contains("button", "View signed agreement").click();
    cy.get('section[aria-label="Agreements"]').contains("UCL Information Security Policy").should("be.visible");
  });
});
