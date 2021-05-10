/// <reference types="cypress" />

describe("Authentication", () => {
  beforeEach(() => {
    cy.clearAuth();
  })

  it("Can log in", () => {
    cy.visit('/');

    cy.get("#environment").select("staging");
    cy.get('#auth').click();

    cy.handleLobby();

    cy.get('#user', { timeout: 60000 }).should('be.visible');
  });
});
