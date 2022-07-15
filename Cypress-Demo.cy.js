describe('Dashboard Admin Authentication', () => {
	it('Attempts login with invalid credentials and checks for 400', () => {
		cy.visit('https://dashboard-v2-dev.projectcanary.io/')
		cy.intercept('POST', '/').as('post')
		cy.get('#root amplify-sign-in')
			.shadow()
			.find('#username')
			.type('QA+Admin@projectcanary.com')
		cy.get('#root amplify-sign-in')
			.shadow()
			.find('#password')
			.type('IncorrectPassword')
		cy.get('#root amplify-sign-in')
			.shadow()
			.find('.button')
			.contains('Sign In')
			.click()
		cy.wait('@post').then(interception => {
			expect(interception.response.statusCode).to.equal(400)
		})
  	})
})

describe('Validate admin access', () => {
	beforeEach('Login', () => {
		cy.cmLogin(Cypress.env('cmAdminUsername'), Cypress.env('cmAdminPassword'))
	})
  	it('Logs Admin in, accesses user management, and checks for 200', () => {
		cy.intercept('GET', 'https://api-dev-v2.projectcanary.io/users').as('get')
		cy.get('.jss27 > .MuiButtonBase-root')
			.click()
		cy.get('#user-menu [role=menuitem]')
			.contains('User Management')
			.click()
		cy.wait('@get').then(interception => {
			expect(interception.response.statusCode).to.equal(200)
		})
  	})

  	it('Logs admin in and checks that they see multiple campanies', () => {
		cy.intercept('GET', Cypress.env('baseURL') + 'operational-units/hierarchy').as('hierarchy')
		cy.wait('@hierarchy').then(companyCount => {
			cy.get(companyCount.response.body)
				.its('length')
				.should('be.gte', 2)
		})
	})
})

describe('Validate non-admin access', () => {
	it('Logs non-admin in and checks that they see 1 company', () => {
		cy.cmLogin(Cypress.env('cmViewerUsername'), Cypress.env('cmViewerPassword'))
		cy.intercept('GET', Cypress.env('baseURL') + 'operational-units/hierarchy').as('hierarchy')
		cy.wait('@hierarchy').then(companyCount => {
			cy.get(companyCount.response.body)
				.its('length')
				.should('be.eq', 1)
		})
	})

	it('Logs out', () => {
		cy.cmLogout()
	})
})