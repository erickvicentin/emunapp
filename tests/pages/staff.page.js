import BasePage from './base.page.js';

const STAFF_SECTION = '[data-testid="staff-section"]';
const STAFF_TITLE = '[data-testid="staff-title"]';
const STAFF_COUNT_BADGE = '[data-testid="staff-count-badge"]';
const STAFF_EXPORT_BTN = '[data-testid="staff-export-btn"]';
const STAFF_CREATE_BTN = '[data-testid="staff-create-btn"]';
const STAFF_SEARCH_BAR = '[data-testid="staff-search-bar"]';
const STAFF_SEARCH_INPUT = '[data-testid="staff-search-input"]';
const STAFF_TABLE = '[data-testid="staff-table"]';
const STAFF_TABLE_SKELETON = '[data-testid="staff-table-skeleton"]';
const STAFF_EMPTY_STATE = '[data-testid="staff-empty-state"]';

const STAFF_CREATE_SECTION = '[data-testid="staff-create-section"]';
const STAFF_CREATE_TITLE = '[data-testid="staff-create-title"]';
const STAFF_CREATE_NOTICE = '[data-testid="staff-create-activation-notice"]';
const STAFF_CREATE_SUBMIT_BTN = '[data-testid="staff-create-submit-btn"]';

class StaffPage extends BasePage {
  async waitForPageLoad() {
    await this.waitForElement(STAFF_SECTION);
  }

  async waitForStaffLoaded(timeout = 10000) {
    await browser.waitUntil(
      async () => {
        const skeleton = await $(STAFF_TABLE_SKELETON);
        const skeletonVisible = await skeleton.isExisting();
        if (skeletonVisible) return false;
        const table = await $(STAFF_TABLE);
        const empty = await $(STAFF_EMPTY_STATE);
        return (await table.isDisplayed()) || (await empty.isDisplayed());
      },
      {
        timeout,
        timeoutMsg: 'Expected staff list or empty state to finish loading',
      }
    );
  }

  async isSectionDisplayed() {
    return this.isElementDisplayed(STAFF_SECTION);
  }

  async getTitleText() {
    return this.getElementText(STAFF_TITLE);
  }

  async isCountBadgeDisplayed() {
    return this.isElementDisplayed(STAFF_COUNT_BADGE);
  }

  async isCreateButtonDisplayed() {
    return this.isElementDisplayed(STAFF_CREATE_BTN);
  }

  async isExportButtonDisplayed() {
    const btn = await $(STAFF_EXPORT_BTN);
    return btn.isExisting();
  }

  async isSearchBarDisplayed() {
    return this.isElementDisplayed(STAFF_SEARCH_BAR);
  }

  async isSearchInputDisplayed() {
    return this.isElementDisplayed(STAFF_SEARCH_INPUT);
  }

  async isTableOrEmptyDisplayed() {
    const table = await $(STAFF_TABLE);
    const empty = await $(STAFF_EMPTY_STATE);
    return (await table.isDisplayed()) || (await empty.isDisplayed());
  }

  async clickCreateStaff() {
    await this.clickElement(STAFF_CREATE_BTN);
  }

  async waitForCreatePageLoad() {
    await this.waitForElement(STAFF_CREATE_SECTION);
  }

  async isCreateSectionDisplayed() {
    return this.isElementDisplayed(STAFF_CREATE_SECTION);
  }

  async getCreateTitleText() {
    return this.getElementText(STAFF_CREATE_TITLE);
  }

  async isCreateNoticeDisplayed() {
    return this.isElementDisplayed(STAFF_CREATE_NOTICE);
  }

  async submitCreateForm() {
    await this.clickElement(STAFF_CREATE_SUBMIT_BTN);
  }

  async isCreateSectionTextVisible(text) {
    const content = await this.getElementText(STAFF_CREATE_SECTION);
    return content.includes(text);
  }
}

export default new StaffPage();
