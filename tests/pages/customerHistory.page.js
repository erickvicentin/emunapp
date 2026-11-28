import BasePage from './base.page.js';

const HISTORY_SECTION = '[data-testid="customer-history-section"]';
const HISTORY_TITLE = '[data-testid="customer-history-title"]';
const ATTENDANCE_CARD = '[data-testid="customer-history-attendance-card"]';
const ATTENDANCE_PERCENTAGE = '[data-testid="customer-history-attendance-percentage"]';
const HISTORY_TABLE = '[data-testid="customer-history-table"]';
const HISTORY_MOBILE_LIST = '[data-testid="customer-history-mobile-list"]';
const HISTORY_EMPTY = '[data-testid="customer-history-empty"]';

export default class CustomerHistoryPage extends BasePage {
  async waitForSection() {
    await this.waitForElement(HISTORY_SECTION);
  }

  async getSectionTitle() {
    return this.getElementText(HISTORY_TITLE);
  }

  async isAttendanceCardVisible() {
    return this.isElementDisplayed(ATTENDANCE_CARD);
  }

  async getAttendancePercentageText() {
    return this.getElementText(ATTENDANCE_PERCENTAGE);
  }

  async hasTableOrEmptyState() {
    const tableVisible = await this.isElementDisplayed(HISTORY_TABLE).catch(() => false);
    const mobileVisible = await this.isElementDisplayed(HISTORY_MOBILE_LIST).catch(() => false);
    const emptyVisible = await this.isElementDisplayed(HISTORY_EMPTY).catch(() => false);
    return tableVisible || mobileVisible || emptyVisible;
  }
}
