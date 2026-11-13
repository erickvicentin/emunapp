const TAB_EQUIPO = '[data-testid="login-tab-equipo"]';
const IDENTIFIER_INPUT = '[data-testid="login-identifier-input"]';
const PASSWORD_INPUT = '[data-testid="login-password-input"]';
const SUBMIT_BUTTON = '[data-testid="login-submit-btn"]';
const ADMIN_SIDEBAR = '[data-testid="admin-sidebar"]';

class LoginPage {
  async open() {
    await browser.url('/login');
  }

  async selectEquipoRole() {
    const tab = await $(TAB_EQUIPO);
    await tab.waitForClickable();
    await tab.click();
  }

  async loginAsAdmin(email, password) {
    await this.open();
    await this.selectEquipoRole();

    const identifierField = await $(IDENTIFIER_INPUT);
    await identifierField.waitForDisplayed();
    await identifierField.setValue(email);

    const passwordField = await $(PASSWORD_INPUT);
    await passwordField.waitForDisplayed();
    await passwordField.setValue(password);

    const submitBtn = await $(SUBMIT_BUTTON);
    await submitBtn.waitForClickable();
    await submitBtn.click();

    await $(ADMIN_SIDEBAR).waitForDisplayed({ timeout: 15000 });
  }
}

export default new LoginPage();
