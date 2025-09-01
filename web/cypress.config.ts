const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    baseUrl: process.env.CYPRESS_baseUrl || "http://localhost:8000",
    supportFile: "cypress/support/e2e.ts",
    specPattern: "cypress/e2e/**/*.cy.ts",
    video: false,
    screenshotOnRunFailure: true,
    experimentalStudio: true,
    experimentalModifyObstructiveThirdPartyCode: true,
    chromeWebSecurity: false, // Necessary for cross-origin logins like AAD
    defaultCommandTimeout: 10000,
    env: {
      NEXT_PUBLIC_AGREEMENT_TIMER: 1,
    },
  },
});
