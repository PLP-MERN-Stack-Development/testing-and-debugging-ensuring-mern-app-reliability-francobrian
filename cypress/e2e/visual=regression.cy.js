// cypress/e2e/visual-regression.cy.js
describe('Visual Regression Tests', () => {
  it('should match homepage screenshot', () => {
    cy.visit('/');
    cy.contains('h1', 'Welcome to Our Blog').should('be.visible');
    
    // Compare with baseline screenshot
    cy.matchImageSnapshot('homepage');
  });

  it('should match login page screenshot', () => {
    cy.visit('/login');
    cy.get('form').should('be.visible');
    
    cy.matchImageSnapshot('login-page');
  });

  it('should match post detail page screenshot', () => {
    cy.visit('/posts/sample-post-title');
    cy.contains('h1', 'Sample Post Title').should('be.visible');
    
    cy.matchImageSnapshot('post-detail-page');
  });
});
