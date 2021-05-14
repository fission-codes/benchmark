/// <reference types="cypress" />

describe("Filesystem", () => {
  before(() => {
    cy.clearAuth();

    cy.visit("/");

    // Request paths:
    cy.get('#path-name').type('Documents/Testing')
    cy.get('#path-type').select('private')
    cy.get('#path-add').click()
    cy.get('#path-name').type('Pictures/Testing')
    cy.get('#path-type').select('public')
    cy.get('#path-add').click()


    const version = Cypress.env("WEBNATIVE") || "latest";

    // Pick the current version
    cy.get("#webnative-version").select(version);

    cy.get("#environment").select("staging");

    cy.get("#auth").click();

    cy.handleLobby();

    cy.get("#user", { timeout: 60000 }).should("be.visible");
  });

  it ('shows the requested directories', () => {
    cy.get('a').should('contain', 'private/Apps/Fission/Benchmark')
    cy.get('a').should('contain', 'private/Documents/Testing')
  })

  it ('mkdir', () => {
    // Change into the appDir
    cy.get('a').contains('Fission/Benchmark').click();
    cy.get('#folder-name').type('Testing');
    cy.get('#add-folder').click();
    cy.get('#ls-output').should('contain', 'Testing');
  })
});
