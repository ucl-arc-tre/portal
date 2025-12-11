# Cypress Test Suite

This project uses the [Cypress](https://www.cypress.io/) testing framework for running e2e tests. [Accessibility testing](https://docs.cypress.io/app/guides/accessibility-testing) is incorporated into Cypress with the [cypress-axe extension](https://www.npmjs.com/package/cypress-axe).

## Test Structure

```
cypress/e2e/
├── accessibility/          # Accessibility compliance tests
├── integration/            # Full end-to-end tests with real database interaction
└── pages/                  # UI-focused tests with mocked APIs
```

## Test Categories

### Accessibility Tests

These tests ensure compliance with accessibility standards.

### Integration Tests

These tests focus on the full integration of the frontend, backend, and database.

To avoid permanently changing the database, cleanup functions are used to reset the state after the tests run.

When to use integration tests:

- Testing complete user workflows
- Verifying data persistence and retrieval
- Testing business logic that spans multiple systems

### UI Tests

These tests focus on UI behaviours.

Data scenarios can be simulated using mocked data via fixtures.

When to use UI tests:

- Testing form validation and user interactions
- Verifying component rendering and state changes
- Testing UI logic and user experience

## Running Tests

### Development Workflow

```bash
# Requires the backend to be running

# Open Cypress UI for debugging and running individual test suites
npm run cypress:open

# Runs all test suites for faster feedback and during CI
npm run cypress:headless
```

### Testing Different Environments

#### Testing the dev build

The easiest way to run the full e2e testing suite is with the following command from the project root directory:

```
make test-e2e-dev
```

This will run all frontend tests in headless mode against the dockerised dev server running on `localhost:8000`.

#### Testing the release production build

Run the following command from the project root directory:

```
make test-e2e-release
```

These tests simulate the full production build of the application.

## Test Setup

### Authentication Setup

Authenticated end-to-end tests require EntraID usernames and passwords to be set in a `cypress.env.json` file. Create it based on [cypress.sample.env.json](./cypress.sample.env.json).

Two sets of credentials will be needed to simulate both an admin user and a user with a base role during tests. To generate these credentials, speak to a senior team member.

### Test Data

You can test edge cases by adding custom fixture data along with api intercepts. This will allow the tests to run even in the absence of the backend api.

Tests can be run against both the dockerised local dev environment as well as the full dockerised release production build.

Failing tests will produce downloadable screenshots saved in `/web/cypress/screenshots` to make debugging test failures easier. Make sure not to commit this folder to git.

## CI Integration

The e2e tests are also configured to run during CI via a GitHub action workflow.

The CI tests are run against the full release version of the dockerised setup to test against the production version of the application.

## Debugging

### Common Issues

- **State pollution**: This can happen when integration tests modify the database. To avoid this, make sure to use proper cleanup in `beforeEach` hooks.
- **Timing issues**: Use `cy.wait()` for API calls, `cy.contains()` for text verification

### Debug Tools

- Use `cypress:open` for interactive debugging
- Check Network tab for API call verification
- Use `cy.pause()` to stop test execution at specific points
