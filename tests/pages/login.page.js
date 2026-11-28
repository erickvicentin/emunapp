const IDENTIFIER_INPUT = '[data-testid="login-identifier-input"]';
const PASSWORD_INPUT = '[data-testid="login-password-input"]';
const SUBMIT_BUTTON = '[data-testid="login-submit-btn"]';
const ADMIN_SIDEBAR = '[data-testid="admin-sidebar"]';
const CUSTOMER_SIDEBAR = '[data-testid="customer-sidebar"]';

class LoginPage {
  async open() {
    await browser.url('/login');
  }

  async submitCredentials(email, password) {
    await this.open();

    const identifierField = await $(IDENTIFIER_INPUT);
    await identifierField.waitForDisplayed();
    await identifierField.setValue(email);

    const passwordField = await $(PASSWORD_INPUT);
    await passwordField.waitForDisplayed();
    await passwordField.setValue(password);

    const submitBtn = await $(SUBMIT_BUTTON);
    await submitBtn.waitForClickable();
    await submitBtn.click();
  }

  async loginAsAdmin(email, password) {
    await this.submitCredentials(email, password);
    await $(ADMIN_SIDEBAR).waitForDisplayed({ timeout: 15000 });
  }

  async loginAsCustomer(email, password) {
    await this.submitCredentials(email, password);
    await $(CUSTOMER_SIDEBAR).waitForDisplayed({ timeout: 15000 });
  }
}

export default new LoginPage();
