// beforeEach(() => {
//   cy.clearCookies();
//   cy.clearLocalStorage();
// });

// describe("Contract Management via Study", () => {
//   beforeEach(() => {
//     cy.loginAsBase();
//     cy.mockAuthAsStudyOwner();
//     cy.mockStudiesWithNewStudy();
//     cy.mockStudyAccess();
//     cy.mockAssetAccess();
//     cy.mockStudyAgreementText();
//     cy.mockStudyAgreementsConfirmed();
//     cy.mockInformationAssetsWithSample();
//   });

//   it("should display contract management section for a study", () => {
//     cy.mockContractsEmpty();

//     cy.visit("/studies/manage?studyId=123456789");
//     cy.waitForAuth();
//     cy.wait("@getStudyById");
//     cy.wait("@getStudyAgreementText");
//     cy.wait("@getStudyAgreementsConfirmed");

//     // Wait for contracts to load
//     cy.wait("@getContractsEmpty");

//     // Should show empty contract state
//     cy.contains("No contracts uploaded").should("be.visible");
//     cy.contains("Add Contract").should("be.visible");
//   });

//   it("should successfully upload a contract", () => {
//     cy.mockContractsEmpty();
//     cy.mockContractUpload();
//     cy.mockStudyContractsWtihSample();

//     cy.visit("/studies/manage?studyId=123456789");
//     cy.waitForAuth();
//     cy.wait("@getStudyById");
//     cy.wait("@getStudyAgreementText");
//     cy.wait("@getStudyAgreementsConfirmed");

//     // Open upload form
//     cy.contains("Add Contract").click();

//     // Fill in the form
//     cy.get("input[name='organisationSignatory']").type("Test Organization");
//     cy.get("input[name='thirdPartyName']").type("Test Third Party");
//     cy.get("select[name='status']").select("proposed");
//     cy.get("input[name='startDate']").type("2024-01-01");
//     cy.get("input[name='expiryDate']").type("2025-12-31");

//     // Simulate a pdf upload
//     cy.fixture("valid_nhsd_certificate.pdf", "base64").then((fileContent) => {
//       cy.get("input[type='file']").selectFile(
//         {
//           contents: Cypress.Buffer.from(fileContent, "base64"),
//           fileName: "sample-contract.pdf",
//           mimeType: "application/pdf",
//         },
//         { force: true }
//       );
//     });

//     cy.get("button[type='submit']").click();

//     cy.wait("@uploadContract");
//     cy.wait("@getStudyContractsWithSample");

//     // Verify the mock contract is displayed
//     cy.contains("sample-contract.pdf").should("be.visible");
//     cy.contains("Sample Organization").should("be.visible");
//   });

//   it("should allow downloading contracts", () => {
//     cy.mockStudyContractsWtihSample();
//     cy.mockContractDownload();

//     cy.visit("/studies/manage?studyId=123456789");
//     cy.waitForAuth();
//     cy.wait("@getStudyById");
//     cy.wait("@getStudyAgreementText");
//     cy.wait("@getStudyAgreementsConfirmed");
//     cy.wait("@getStudyContractsWithSample");

//     // Verify contract is displayed
//     cy.contains("sample-contract.pdf").should("be.visible");
//     cy.contains("Active").should("be.visible");

//     cy.contains("Download PDF").click();

//     // Verify download request was made
//     cy.wait("@downloadContract");
//   });

//   it("should prepopulate form fields when editing a contract", () => {
//     cy.mockStudyContractsWtihSample();

//     cy.visit("/studies/manage?studyId=123456789");
//     cy.waitForAuth();
//     cy.wait("@getStudyById");
//     cy.wait("@getStudyAgreementText");
//     cy.wait("@getStudyAgreementsConfirmed");
//     cy.wait("@getStudyContractsWithSample");

//     cy.contains("Edit").first().click();

//     // Verify form is prepopulated with existing values
//     cy.get("input[name='organisationSignatory']").should("have.value", "Sample Organization");
//     cy.get("input[name='thirdPartyName']").should("have.value", "Sample Third Party");
//     cy.get("select[name='status']").should("have.value", "active");
//     cy.get("input[name='startDate']").should("have.value", "2024-01-01");
//     cy.get("input[name='expiryDate']").should("have.value", "2025-12-31");

//     // Verify the dialog title shows we're editing
//     cy.contains("Edit Contract").should("be.visible");
//     cy.contains("Current file: sample-contract.pdf").should("be.visible");
//     cy.contains("Choose new PDF file (optional)").should("be.visible");
//   });

//   it("should successfully submit edited contract data", () => {
//     cy.mockContractEdit();
//     cy.mockStudyContractsWtihSample();

//     cy.visit("/studies/manage?studyId=123456789");
//     cy.waitForAuth();
//     cy.wait("@getStudyById");
//     cy.wait("@getStudyAgreementText");
//     cy.wait("@getStudyAgreementsConfirmed");
//     cy.wait("@getStudyContractsWithSample");

//     cy.contains("Edit").first().click();

//     // Modify a form field
//     cy.get("select[name='status']").select("expired");

//     // Submit the form
//     cy.contains("Update Contract").click();

//     cy.wait("@editContract");
//     cy.wait("@getStudyContractsWithSample");

//     // Verify the mock contract is displayed
//     cy.contains("sample-contract.pdf").should("be.visible");
//     cy.contains("Sample Organization").should("be.visible");
//   });
// });

// // will uncomment when UI has been done
// // describe("Contract Management via Asset", () => {
// //   beforeEach(() => {
// //     cy.loginAsBase();
// //     cy.mockAuthAsStudyOwner();
// //     cy.mockStudiesWithNewStudy();
// //     cy.mockStudyAccess();
// //     cy.mockAssetAccess();
// //     cy.mockStudyAgreementText();
// //     cy.mockStudyAgreementsConfirmed();
// //     cy.mockInformationAssetsWithSample();
// //   });

// //   it("should display contract management section for a study", () => {
// //     cy.mockContractsEmpty();

// //     cy.visit("/studies/manage?studyId=123456789");
// //     cy.waitForAuth();
// //     cy.wait("@getStudyById");
// //     cy.wait("@getStudyAgreementText");
// //     cy.wait("@getStudyAgreementsConfirmed");

// //     // Wait for contracts to load
// //     cy.wait("@getContractsEmpty");

// //     // Should show empty contract state
// //     cy.contains("No contracts uploaded").should("be.visible");
// //     cy.contains("Add Contract").should("be.visible");
// //   });

// //   // it("should display contract management section for an asset", () => {
// //   //   cy.mockContractsEmpty();

// //   //   cy.visit("/studies/manage?studyId=123456789");
// //   //   cy.waitForAuth();
// //   //   cy.wait("@getStudyById");
// //   //   cy.wait("@getStudyAgreementText");
// //   //   cy.wait("@getStudyAgreementsConfirmed");
// //   //   cy.wait("@getAssetsWithSample");

// //   //   // Navigate to asset management page
// //   //   cy.contains("Sample Asset Title 1").should("be.visible");
// //   //   cy.contains("Manage Asset").click();

// //   //   // Wait for asset and contracts to load
// //   //   cy.wait("@getAssetById");
// //   //   cy.wait("@getContractsEmpty");

// //   //   // Should show empty contract state
// //   //   cy.contains("No contracts uploaded").should("be.visible");
// //   //   cy.contains("Add Contract").should("be.visible");
// //   // });

// //   it("should successfully upload a contract", () => {
// //     cy.mockContractsEmpty();
// //     cy.mockContractUpload();
// //     cy.mockStudyContractsWtihSample();

// //     cy.visit("/studies/manage?studyId=123456789");
// //     cy.waitForAuth();
// //     cy.wait("@getStudyById");
// //     cy.wait("@getStudyAgreementText");
// //     cy.wait("@getStudyAgreementsConfirmed");
// //     cy.wait("@getAssetsWithSample");

// //     // Navigate to asset contracts
// //     cy.contains("Sample Asset Title 1").should("be.visible");
// //     cy.contains("Manage Asset").click();

// //     // Wait for asset and contracts to load
// //     cy.wait("@getAssetById");

// //     // Open upload form
// //     cy.contains("Add Contract").click();

// //     // Fill in the form
// //     cy.get("input[name='organisationSignatory']").type("Test Organization");
// //     cy.get("input[name='thirdPartyName']").type("Test Third Party");
// //     cy.get("select[name='status']").select("proposed");
// //     cy.get("input[name='startDate']").type("2024-01-01");
// //     cy.get("input[name='expiryDate']").type("2025-12-31");

// //     // Simulate a pdf upload
// //     cy.fixture("valid_nhsd_certificate.pdf", "base64").then((fileContent) => {
// //       cy.get("input[type='file']").selectFile(
// //         {
// //           contents: Cypress.Buffer.from(fileContent, "base64"),
// //           fileName: "sample-contract.pdf",
// //           mimeType: "application/pdf",
// //         },
// //         { force: true }
// //       );
// //     });

// //     cy.get("button[type='submit']").click();

// //     cy.wait("@uploadContract");
// //     cy.wait("@getStudyContractsWithSample");

// //     // Verify the mock contract is displayed
// //     cy.contains("sample-contract.pdf").should("be.visible");
// //     cy.contains("Sample Organization").should("be.visible");
// //   });

// //   it("should allow downloading contracts", () => {
// //     cy.mockStudyContractsWtihSample();
// //     cy.mockContractDownload();

// //     cy.visit("/studies/manage?studyId=123456789");
// //     cy.waitForAuth();
// //     cy.wait("@getStudyById");
// //     cy.wait("@getStudyAgreementText");
// //     cy.wait("@getStudyAgreementsConfirmed");
// //     cy.wait("@getAssetsWithSample");

// //     // Navigate to asset contracts
// //     cy.contains("Sample Asset Title 1").should("be.visible");
// //     cy.contains("Manage Asset").click();

// //     // Wait for asset and contracts to load
// //     cy.wait("@getAssetById");
// //     cy.wait("@getStudyContractsWithSample");

// //     // Verify contract is displayed
// //     cy.contains("sample-contract.pdf").should("be.visible");
// //     cy.contains("Active").should("be.visible");

// //     cy.contains("Download PDF").click();

// //     // Verify download request was made
// //     cy.wait("@downloadContract");
// //   });

// //   it("should prepopulate form fields when editing a contract", () => {
// //     cy.mockStudyContractsWtihSample();

// //     cy.visit("/studies/manage?studyId=123456789");
// //     cy.waitForAuth();
// //     cy.wait("@getStudyById");
// //     cy.wait("@getStudyAgreementText");
// //     cy.wait("@getStudyAgreementsConfirmed");
// //     cy.wait("@getAssetsWithSample");

// //     cy.contains("Sample Asset Title 1").should("be.visible");
// //     cy.contains("Manage Asset").click();

// //     cy.wait("@getAssetById");
// //     cy.wait("@getStudyContractsWithSample");

// //     cy.contains("Edit").first().click();

// //     // Verify form is prepopulated with existing values
// //     cy.get("input[name='organisationSignatory']").should("have.value", "Sample Organization");
// //     cy.get("input[name='thirdPartyName']").should("have.value", "Sample Third Party");
// //     cy.get("select[name='status']").should("have.value", "active");
// //     cy.get("input[name='startDate']").should("have.value", "2024-01-01");
// //     cy.get("input[name='expiryDate']").should("have.value", "2025-12-31");

// //     // Verify the dialog title shows we're editing
// //     cy.contains("Edit Contract").should("be.visible");
// //     cy.contains("Current file: sample-contract.pdf").should("be.visible");
// //     cy.contains("Choose new PDF file (optional)").should("be.visible");
// //   });

// //   it("should successfully submit edited contract data", () => {
// //     cy.mockContractEdit();
// //     cy.mockStudyContractsWtihSample();

// //     cy.visit("/studies/manage?studyId=123456789");
// //     cy.waitForAuth();
// //     cy.wait("@getStudyById");
// //     cy.wait("@getStudyAgreementText");
// //     cy.wait("@getStudyAgreementsConfirmed");
// //     cy.wait("@getAssetsWithSample");

// //     cy.contains("Sample Asset Title 1").should("be.visible");
// //     cy.contains("Manage Asset").click();

// //     cy.wait("@getAssetById");
// //     cy.wait("@getStudyContractsWithSample");

// //     cy.contains("Edit").first().click();

// //     // Modify a form field
// //     cy.get("select[name='status']").select("expired");

// //     // Submit the form
// //     cy.contains("Update Contract").click();

// //     cy.wait("@editContract");
// //     cy.wait("@getStudyContractsWithSample");

// //     // Verify the mock contract is displayed
// //     cy.contains("sample-contract.pdf").should("be.visible");
// //     cy.contains("Sample Organization").should("be.visible");
// //   });
// // });
