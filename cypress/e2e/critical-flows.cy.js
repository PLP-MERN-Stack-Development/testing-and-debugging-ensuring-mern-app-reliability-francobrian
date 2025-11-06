// cypress/e2e/critical-flows.cy.js
describe('Critical User Flows', () => {
  beforeEach(() => {
    cy.intercept('GET', '/api/posts*').as('getPosts');
    cy.intercept('POST', '/api/auth/login').as('login');
    cy.intercept('POST', '/api/posts').as('createPost');
  });

  it('should complete user registration and post creation flow', () => {
    // Visit homepage
    cy.visit('/');
    cy.contains('h1', 'Welcome to Our Blog').should('be.visible');

    // Navigate to register
    cy.get('nav').contains('Register').click();
    cy.url().should('include', '/register');

    // Fill registration form
    cy.get('input[name="username"]').type('newuser');
    cy.get('input[name="email"]').type('newuser@example.com');
    cy.get('input[name="password"]').type('password123');
    cy.get('button[type="submit"]').click();

    // Verify redirect to login
    cy.url().should('include', '/login');
    cy.contains('Registration successful').should('be.visible');
  });

  it('should login and create a new post', () => {
    // Login
    cy.visit('/login');
    cy.get('input[name="email"]').type(Cypress.env('testUser').email);
    cy.get('input[name="password"]').type(Cypress.env('testUser').password);
    cy.get('button[type="submit"]').click();

    // Wait for login and redirect
    cy.wait('@login');
    cy.url().should('include', '/dashboard');

    // Navigate to create post
    cy.contains('Create Post').click();
    cy.url().should('include', '/posts/create');

    // Fill post form
    cy.get('input[name="title"]').type('My New Test Post');
    cy.get('textarea[name="content"]').type('This is the content of my test post created via Cypress testing.');
    cy.get('select[name="category"]').select('technology');
    cy.get('button[type="submit"]').click();

    // Verify post creation
    cy.wait('@createPost').its('response.statusCode').should('eq', 201);
    cy.url().should('include', '/posts/');
    cy.contains('h1', 'My New Test Post').should('be.visible');
    cy.contains('Post created successfully').should('be.visible');
  });

  it('should handle authentication errors gracefully', () => {
    // Attempt login with wrong credentials
    cy.visit('/login');
    cy.get('input[name="email"]').type('wrong@example.com');
    cy.get('input[name="password"]').type('wrongpassword');
    cy.get('button[type="submit"]').click();

    // Verify error message
    cy.contains('Invalid email or password').should('be.visible');
    cy.url().should('include', '/login'); // Should stay on login page
  });

  it('should test post search and filtering', () => {
    // Visit posts page
    cy.visit('/posts');
    cy.wait('@getPosts');

    // Search for posts
    cy.get('input[placeholder*="search"]').type('technology{enter}');
    cy.wait('@getPosts');

    // Filter by category
    cy.get('select').first().select('technology');
    cy.wait('@getPosts');

    // Verify filtered results
    cy.get('[data-testid="post-item"]').should('have.length.at.least', 1);
    cy.get('[data-testid="post-item"]').first().should('contain', 'technology');
  });
});