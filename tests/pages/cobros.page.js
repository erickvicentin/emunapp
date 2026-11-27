import BasePage from './base.page.js';

const COBROS_SECTION = '[data-testid="cobros-section"]';
const COBROS_TITLE = '[data-testid="cobros-title"]';
const COBROS_CONFIG_CARD = '[data-testid="cobros-config-card"]';
const COBROS_ALIAS_INPUT = '[data-testid="cobros-alias-input"]';
const COBROS_CVU_INPUT = '[data-testid="cobros-cvu-input"]';
const COBROS_TITULAR_INPUT = '[data-testid="cobros-titular-input"]';
const COBROS_CUIL_INPUT = '[data-testid="cobros-cuil-input"]';
const COBROS_EXPIRY_HOURS_INPUT = '[data-testid="cobros-expiry-hours-input"]';
const COBROS_FILTER_TABS = '[data-testid="cobros-filter-tabs"]';
const COBROS_REGISTER_CASH_BTN = '[data-testid="cobros-register-cash-btn"]';
const CASH_NOTICE_DIALOG = '[data-testid="cash-notice-dialog"]';

class CobrosPage extends BasePage {
  async waitForPageLoad() {
    await this.waitForElement(COBROS_SECTION);
  }

  async getTitleText() {
    return this.getElementText(COBROS_TITLE);
  }

  async isConfigCardDisplayed() {
    return this.isElementDisplayed(COBROS_CONFIG_CARD);
  }

  async areAccountConfigFieldsDisplayed() {
    const checks = await Promise.all([
      this.isElementDisplayed(COBROS_ALIAS_INPUT),
      this.isElementDisplayed(COBROS_CVU_INPUT),
      this.isElementDisplayed(COBROS_TITULAR_INPUT),
      this.isElementDisplayed(COBROS_CUIL_INPUT),
      this.isElementDisplayed(COBROS_EXPIRY_HOURS_INPUT),
    ]);
    return checks.every(Boolean);
  }

  async isFilterTabsDisplayed() {
    return this.isElementDisplayed(COBROS_FILTER_TABS);
  }

  async openCashNoticeModal() {
    await this.clickElement(COBROS_REGISTER_CASH_BTN);
    await this.waitForElement(CASH_NOTICE_DIALOG);
  }

  async isCashNoticeModalDisplayed() {
    return this.isElementDisplayed(CASH_NOTICE_DIALOG);
  }
}

export default new CobrosPage();
