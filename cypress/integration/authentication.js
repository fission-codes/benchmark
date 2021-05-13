/// <reference types="cypress" />

describe("Authentication", () => {
  beforeEach(() => {
    cy.clearAuth();
  });

  it("Can log in", () => {
    cy.visit("/");

    const version = Cypress.env("WEBNATIVE") || "latest";

    // Pick the current version
    cy.get("#webnative-version").select(version);

    cy.get("#environment").select("staging");
    cy.get("#auth").click();

    cy.handleLobby();

    cy.get("#user", { timeout: 60000 }).should("be.visible");
  });
});
