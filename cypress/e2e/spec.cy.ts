describe('Home page', () => {
  it('should display the main heading', () => {
    cy.visit('/');
    cy.contains('h1', 'Split Bareng').should('be.visible');
  });
});
