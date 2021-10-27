/**
 * This cypress command handles interaction with the auth lobby.
 * We don't reset the browser for every test, so it will conditionally create a new account or approve.
 */
Cypress.Commands.add("handleLobby", (email) => {
  cy.url().should("contain", "auth");
  cy.get("button")
    .first()
    .then(($btn) => {
      if ($btn.text() === "Yes") {
        $btn.click();
      } else {
        $btn.click();
        cy.get("#email").type("james@fission.codes");
        cy.get("#username").type("test-" + Date.now());
        cy.contains("Get started").click();
        cy.contains("Remind me later", { timeout: 30000 }).click();
        cy.contains("Yes").click();
      }
    });
});

Cypress.Commands.add("clearAuth", () => {
  sessionStorage.clear();
  indexedDB.deleteDatabase("localforge");
  indexedDB.deleteDatabase("keystore");
});
