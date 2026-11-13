const SNACKBAR = '[data-testid="snackbar"]';
const SNACKBAR_MESSAGE = '[data-testid="snackbar-message"]';

/**
 * BasePage
 * Shared WebdriverIO interaction helpers for all Page Object Models.
 * All assertions must remain in tests/steps/*.steps.js.
 */
export default class BasePage {
  async openUrl(path) {
    await browser.url(path);
  }

  async getCurrentUrl() {
    return browser.getUrl();
  }

  async waitForElement(selector, timeout = 10000) {
    const element = await $(selector);
    await element.waitForDisplayed({ timeout });
    return element;
  }

  async waitForElementToDisappear(selector, timeout = 10000) {
    const element = await $(selector);
    await element.waitForDisplayed({ timeout, reverse: true });
  }

  async clickElement(selector) {
    const element = await $(selector);
    await element.waitForExist();
    if (!(await element.isDisplayed({ withinViewport: true }))) {
      await element.scrollIntoView({ block: 'nearest' });
    }
    await element.waitForClickable();
    await element.click();
  }

  async typeValue(selector, value) {
    const element = await this.waitForElement(selector);
    await element.setValue(value);
  }

  async getElementText(selector) {
    const element = await this.waitForElement(selector);
    return element.getText();
  }

  async getInputValue(selector) {
    const element = await this.waitForElement(selector);
    return element.getValue();
  }

  async isElementDisplayed(selector) {
    const element = await $(selector);
    return element.isDisplayed();
  }

  async isElementEnabled(selector) {
    const element = await $(selector);
    return element.isEnabled();
  }

  async selectOptionByValue(selector, value) {
    const element = await this.waitForElement(selector);
    await element.selectByAttribute('value', value);
  }

  async getSnackbarState() {
    const snackbar = await this.waitForElement(SNACKBAR);
    const variant = await snackbar.getAttribute('data-variant');
    const message = await this.getElementText(SNACKBAR_MESSAGE);
    return {
      displayed: await snackbar.isDisplayed(),
      variant,
      message,
    };
  }
}
