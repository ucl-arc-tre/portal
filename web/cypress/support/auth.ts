export function login(username: string, password: string): void {
  cy.wrap(username).should("exist");
  cy.wrap(password && true).should("be.true"); // mask value

  cy.visit("/");
  cy.contains("Login").should("be.visible");
  cy.get("#login").click();

  cy.origin(
    "login.microsoftonline.com",
    {
      args: {
        username,
        password,
      },
    },
    ({ username, password }) => {
      cy.get('input[type="email"]').type(username, {
        log: false,
      });
      cy.get('input[type="submit"]').click();

      cy.get('input[type="password"]').type(password, {
        log: false,
      });
      cy.get('input[type="submit"]').click();
      cy.get('input[type="submit"]').click();
    }
  );
}
