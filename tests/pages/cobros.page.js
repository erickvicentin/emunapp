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
const COBROS_STUDENT_SEARCH = '[data-testid="cobros-student-search-input"]';
const COBROS_FILTER_SELECT = '[data-testid="cobros-filter-select"]';
const COBROS_DATE_FROM = '[data-testid="cobros-date-from-input"]';
const COBROS_DATE_TO = '[data-testid="cobros-date-to-input"]';
const COBROS_REGISTER_CASH_BTN = '[data-testid="cobros-register-cash-btn"]';
const CASH_NOTICE_DIALOG = '[data-testid="cash-notice-dialog"]';
const ADMIN_CONFIG_SECTION = '[data-testid="admin-config-section"]';
const STUDIO_CANCEL_INPUT = '[data-testid="studio-cancel-window-input"]';
const STUDIO_PROFESSOR_INPUT = '[data-testid="studio-professor-name-input"]';
const ADMIN_EMAIL_NOTIF_CARD = '[data-testid="admin-email-notif-card"]';
const NOTIF_SWITCH_NEW_PAYMENT = '[data-testid="admin-notif-switch-nuevo-pago"]';
const NOTIF_SWITCH_STUDENT_CANCEL = '[data-testid="admin-notif-switch-cancelacion-alumno"]';
const NOTIF_SWITCH_LAST_MINUTE = '[data-testid="admin-notif-switch-reserva-ultimo-momento"]';
const NOTIF_SWITCH_DAILY_SUMMARY = '[data-testid="admin-notif-switch-resumen-diario"]';
const NOTIF_SAVE_BTN = '[data-testid="admin-email-notif-save-btn"]';

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
    const checks = await Promise.all([
      this.isElementDisplayed(COBROS_FILTER_TABS),
      this.isElementDisplayed(COBROS_STUDENT_SEARCH),
      this.isElementDisplayed(COBROS_FILTER_SELECT),
      this.isElementDisplayed(COBROS_DATE_FROM),
      this.isElementDisplayed(COBROS_DATE_TO),
    ]);
    return checks.every(Boolean);
  }

  async openCashNoticeModal() {
    await this.clickElement(COBROS_REGISTER_CASH_BTN);
    await this.waitForElement(CASH_NOTICE_DIALOG);
  }

  async isCashNoticeModalDisplayed() {
    return this.isElementDisplayed(CASH_NOTICE_DIALOG);
  }

  async isAdminConfigSectionDisplayed() {
    await this.waitForElement(ADMIN_CONFIG_SECTION);
    const checks = await Promise.all([
      this.isElementDisplayed(COBROS_CONFIG_CARD),
      this.isElementDisplayed(STUDIO_CANCEL_INPUT),
      this.isElementDisplayed(STUDIO_PROFESSOR_INPUT),
      this.isElementDisplayed(ADMIN_EMAIL_NOTIF_CARD),
    ]);
    return checks.every(Boolean);
  }

  async areAdminEmailNotificationTogglesDisplayed() {
    const checks = await Promise.all([
      this.isElementDisplayed(NOTIF_SWITCH_NEW_PAYMENT),
      this.isElementDisplayed(NOTIF_SWITCH_STUDENT_CANCEL),
      this.isElementDisplayed(NOTIF_SWITCH_LAST_MINUTE),
      this.isElementDisplayed(NOTIF_SWITCH_DAILY_SUMMARY),
      this.isElementDisplayed(NOTIF_SAVE_BTN),
    ]);
    return checks.every(Boolean);
  }
}

export default new CobrosPage();
