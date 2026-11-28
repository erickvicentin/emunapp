import BasePage from './base.page.js';

const FORGOT_PASSWORD_BTN = '[data-testid="login-forgot-password-btn"]';
const FORGOT_CARD = '[data-testid="forgot-password-card"]';
const FORGOT_TITLE = '[data-testid="forgot-password-title"]';
const FORGOT_EMAIL_INPUT = '[data-testid="forgot-password-email-input"]';
const FORGOT_SUBMIT_BTN = '[data-testid="forgot-password-submit-btn"]';

const AUTH_ACTION_INVALID = '[data-testid="auth-action-invalid"]';
const AUTH_ACTION_REQUEST_NEW_BTN = '[data-testid="auth-action-request-new-btn"]';

const REGISTER_PASSWORD_INPUT = '#register-password';
const REGISTER_RULE_LIST = '[data-testid="register-password-rule-list"]';
const getRegisterRuleSelector = (ruleId) =>
  `[data-testid="register-password-rule-${ruleId}"]`;

class AuthRecoveryPage extends BasePage {
  async openLogin() {
    await browser.url('/login');
    await this.waitForElement(FORGOT_PASSWORD_BTN);
  }

  async clickForgotPasswordLink() {
    await this.clickElement(FORGOT_PASSWORD_BTN);
    await this.waitForElement(FORGOT_CARD);
  }

  async getForgotTitleText() {
    return this.getElementText(FORGOT_TITLE);
  }

  async enterForgotEmail(email) {
    await this.typeValue(FORGOT_EMAIL_INPUT, email);
  }

  async submitForgotForm() {
    await this.clickElement(FORGOT_SUBMIT_BTN);
  }

  async isForgotCardTextVisible(text) {
    const content = await this.getElementText(FORGOT_CARD);
    return content.includes(text);
  }

  async openAuthAction(query = '') {
    await browser.url(`/auth/action${query}`);
  }

  async waitForInvalidActionCard() {
    await this.waitForElement(AUTH_ACTION_INVALID);
  }

  async isInvalidActionCardDisplayed() {
    return this.isElementDisplayed(AUTH_ACTION_INVALID);
  }

  async clickRequestNewLink() {
    await this.clickElement(AUTH_ACTION_REQUEST_NEW_BTN);
    await this.waitForElement(FORGOT_CARD);
  }

  async openRegister() {
    await browser.url('/register');
    await this.waitForElement(REGISTER_RULE_LIST);
  }

  async typeRegisterPassword(password) {
    await this.typeValue(REGISTER_PASSWORD_INPUT, password);
  }

  async getRegisterRuleValidity(ruleId) {
    const rule = await this.waitForElement(getRegisterRuleSelector(ruleId));
    return rule.getAttribute('data-valid');
  }
}

export default new AuthRecoveryPage();
