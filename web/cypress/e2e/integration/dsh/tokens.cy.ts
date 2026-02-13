beforeEach(() => {
  cy.clearCookies();
  cy.clearLocalStorage();
});

describe("Create use and delete DSH API tokens end-to-end", () => {
  const tokenName = `test-${Date.now()}`;
  let tokenValue = "";

  it("dsh ops should become an approved researcher", () => {
    cy.loginAsDSHOps();
    becomeApprovedResearcher();

    cy.visit("/profile");
    cy.get('[data-cy="create-dsh-token-button"]').click();
    cy.get('[data-cy="create-dsh-token-form"]').should("be.visible");
    cy.get('[name="name"]').type(tokenName);
    cy.get('button[aria-disabled="false"][type="submit"]').click();

    cy.get('[data-cy="dsh-token-value"]').then(($div) => {
      tokenValue = $div.text();
    });
  });

  it("without a token should not be able to use the DSH API", () => {
    cy.request({
      method: "GET",
      url: "/dsh/api/v0/ping",
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.be.equal(406);
    });
    cy.request({
      method: "GET",
      url: "/dsh/api/v0/ping",
      headers: {
        authorization: `Bearer blah`,
      },
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.be.equal(401);
    });
  });

  it("anyone should be able to use the token", () => {
    const headers = {
      authorization: `Bearer ${tokenValue}`,
    };
    cy.request({
      method: "GET",
      url: "/dsh/api/v0/ping",
      headers: headers,
    }).then((response) => {
      expect(response.body).to.have.property("message", "pong");
    });

    cy.request({
      method: "GET",
      url: "/dsh/api/v0/approved-researchers",
      headers: headers,
    }).then((response) => {
      expect(response.body).to.have.include("username,agreed_at,training_expires");
    });
  });

  it("dsh should be able to revoke the token", () => {
    cy.loginAsDSHOps();
    cy.visit("/profile");
    cy.get(`button[aria-label="Delete ${tokenName}"]`).click();
    cy.wait(10100); // wait for the cache to expire
  });

  it("the token should now return an unauthed", () => {
    const headers = {
      authorization: `Bearer ${tokenValue}`,
    };
    cy.request({
      method: "GET",
      url: "/dsh/api/v0/ping",
      headers: headers,
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.be.equal(401);
    });
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

    if (!$body.text().includes("Profile Complete")) {
      cy.get("[data-cy='agreement-agree']").click();

      cy.get("input[type=file]").selectFile("cypress/fixtures/valid_nhsd_certificate.pdf");
      cy.get("[data-cy='training-certificate-sumbit']").click();
    }
  });
}
