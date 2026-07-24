beforeEach(() => {
  cy.clearCookies();
  cy.clearLocalStorage();
});

describe("Create use and delete TRE API tokens end-to-end", () => {
  const tokenName = `test-tre-${Date.now()}`;
  let tokenValue = "";

  it("tre ops should become an approved researcher", () => {
    cy.loginAsTREOps();
    cy.becomeApprovedResearcher();

    cy.visit("/profile");
    cy.get('[data-cy="create-token-button"]').click();
    cy.get('[data-cy="create-token-form"]').should("be.visible");
    cy.get('[name="name"]').type(tokenName);
    cy.get('button[aria-disabled="false"][type="submit"]').click();

    cy.get('[data-cy="token-value"]').then(($div) => {
      tokenValue = $div.text();
    });
  });

  it("without a token should not be able to use the TRE API", () => {
    cy.request({
      method: "GET",
      url: "/tre/api/v0/ping",
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.be.equal(406);
    });
    cy.request({
      method: "GET",
      url: "/tre/api/v0/ping",
      headers: {
        authorization: `Bearer blah`,
      },
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.be.equal(401);
    });
  });

  it("anyone should be able to use the token", () => {
    cy.wait(100); // for the token to become active
    const headers = {
      authorization: `Bearer ${tokenValue}`,
    };
    cy.request({
      method: "GET",
      url: "/tre/api/v0/ping",
      headers: headers,
    }).then((response) => {
      expect(response.body).to.have.property("message", "pong");
    });

    cy.env(["botTREUsername"]).then(({ botTREUsername }) => {
      cy.request({
        method: "GET",
        url: `/tre/api/v0/user-status?username=${encodeURI(botTREUsername)}`,
        headers: headers,
      }).should("be.ok");
    });
  });

  it("tre should be able to revoke the token", () => {
    cy.loginAsTREOps();
    cy.visit("/profile");
    cy.get(`button[aria-label="Delete ${tokenName}"]`).click();
    cy.contains("TRE API Tokens").should("exist");
    cy.wait(100); //  for the token to be deleted
  });

  it("the token should now return an unauthed", () => {
    const headers = {
      authorization: `Bearer ${tokenValue}`,
    };
    cy.request({
      method: "GET",
      url: "/tre/api/v0/ping",
      headers: headers,
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.be.equal(401);
    });
  });
});
