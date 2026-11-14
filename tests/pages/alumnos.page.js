import BasePage from './base.page.js';

const STUDENTS_SECTION = '[data-testid="students-section"]';
const STUDENTS_TITLE = '[data-testid="students-title"]';
const STUDENTS_COUNT_BADGE = '[data-testid="students-count-badge"]';
const EXPORT_BTN = '[data-testid="students-export-btn"]';
const CREATE_BTN = '[data-testid="students-create-btn"]';
const SEARCH_BAR = '[data-testid="students-search-bar"]';
const SEARCH_INPUT = '[data-testid="students-search-input"]';
const SEARCH_CLEAR_BTN = '[data-testid="students-search-clear-btn"]';
const EMPTY_SEARCH_STATE = '[data-testid="students-empty-search"]';
const NOTICE_BANNER = '[data-testid="students-notice"]';
const STUDENTS_TABLE = '[data-testid="students-table"]';
const TABLE_HEADERS = '[data-testid="students-table"] thead th';
const TABLE_ROWS = '[data-testid="students-table"] tbody tr';
const DELETE_DIALOG = '[data-testid="student-delete-dialog"]';
const DELETE_WARNING = '[data-testid="student-delete-warning"]';
const DELETE_CANCEL_BTN = '[data-testid="student-delete-cancel-btn"]';
const DELETE_CONFIRM_BTN = '[data-testid="student-delete-confirm-btn"]';

const getRowSelector = (id) => `[data-testid="student-row-${id}"]`;
const getNameSelector = (id) => `[data-testid="student-name-${id}"]`;
const getDniSelector = (id) => `[data-testid="student-dni-${id}"]`;
const getAgeSelector = (id) => `[data-testid="student-age-${id}"]`;
const getGenderSelector = (id) => `[data-testid="student-gender-${id}"]`;
const getAttendanceSelector = (id) => `[data-testid="student-attendance-${id}"]`;
const getViewBtnSelector = (id) => `[data-testid="student-view-btn-${id}"]`;
const getEditBtnSelector = (id) => `[data-testid="student-edit-btn-${id}"]`;
const getDeleteBtnSelector = (id) => `[data-testid="student-delete-btn-${id}"]`;

class AlumnosPage extends BasePage {
  async waitForPageLoad() {
    await this.waitForElement(STUDENTS_SECTION);
  }

  async isSectionDisplayed() {
    return this.isElementDisplayed(STUDENTS_SECTION);
  }

  async getTitleText() {
    return this.getElementText(STUDENTS_TITLE);
  }

  async getCountBadgeText() {
    return this.getElementText(STUDENTS_COUNT_BADGE);
  }

  async waitForStudentsCount(expectedCount, timeout = 5000) {
    await browser.waitUntil(
      async () => {
        const rows = await $$(TABLE_ROWS);
        const badgeText = await this.getCountBadgeText();
        return (
          rows.length === expectedCount &&
          badgeText.includes(`${expectedCount} registrados`)
        );
      },
      {
        timeout,
        timeoutMsg: `Expected students table to display ${expectedCount} registered students`,
      }
    );
  }

  async isExportButtonDisplayed() {
    return this.isElementDisplayed(EXPORT_BTN);
  }

  async isCreateButtonDisplayed() {
    return this.isElementDisplayed(CREATE_BTN);
  }

  async isSearchBarDisplayed() {
    await this.waitForElement(SEARCH_BAR);
    return this.isElementDisplayed(SEARCH_BAR);
  }

  async searchStudents(query) {
    await this.typeValue(SEARCH_INPUT, query);
  }

  async getSearchInputValue() {
    return this.getInputValue(SEARCH_INPUT);
  }

  async isClearSearchEnabled() {
    return this.isElementEnabled(SEARCH_CLEAR_BTN);
  }

  async clickClearSearch() {
    await this.clickElement(SEARCH_CLEAR_BTN);
  }

  async isEmptySearchStateDisplayed() {
    return this.isElementDisplayed(EMPTY_SEARCH_STATE);
  }

  async clickCreateStudent() {
    await this.clickElement(CREATE_BTN);
  }

  async clickExportExcel() {
    await this.clickElement(EXPORT_BTN);
  }

  async isNoticeDisplayed() {
    await this.waitForElement(NOTICE_BANNER);
    return this.isElementDisplayed(NOTICE_BANNER);
  }

  async getNoticeText() {
    return this.getElementText(NOTICE_BANNER);
  }

  async isTableDisplayed() {
    return this.isElementDisplayed(STUDENTS_TABLE);
  }

  async getHeaderTexts() {
    const headers = await $$(TABLE_HEADERS);
    const texts = [];
    for (const header of headers) {
      texts.push(await header.getText());
    }
    return texts;
  }

  async getRowsCount() {
    const rows = await $$(TABLE_ROWS);
    return rows.length;
  }

  async isStudentRowDisplayed(studentId) {
    return this.isElementDisplayed(getRowSelector(studentId));
  }

  async getStudentRowData(studentId) {
    return {
      name: await $(getNameSelector(studentId)).getText(),
      dni: await $(getDniSelector(studentId)).getText(),
      age: await $(getAgeSelector(studentId)).getText(),
      gender: await $(getGenderSelector(studentId)).getText(),
      attendance: await $(getAttendanceSelector(studentId)).getText(),
    };
  }

  async areRowActionButtonsDisplayed(studentId) {
    const viewDisplayed = await this.isElementDisplayed(getViewBtnSelector(studentId));
    const editDisplayed = await this.isElementDisplayed(getEditBtnSelector(studentId));
    const deleteDisplayed = await this.isElementDisplayed(getDeleteBtnSelector(studentId));
    return viewDisplayed && editDisplayed && deleteDisplayed;
  }

  async clickViewStudent(studentId) {
    await this.clickElement(getViewBtnSelector(studentId));
  }

  async clickEditStudent(studentId) {
    await this.clickElement(getEditBtnSelector(studentId));
  }

  async clickDeleteStudent(studentId) {
    await this.clickElement(getDeleteBtnSelector(studentId));
  }

  async isDeleteDialogOpen() {
    return this.isElementDisplayed(DELETE_DIALOG);
  }

  async getDeleteWarningText() {
    return this.getElementText(DELETE_WARNING);
  }

  async confirmDeleteStudent() {
    await this.clickElement(DELETE_CONFIRM_BTN);
    await this.waitForElementToDisappear(DELETE_DIALOG);
  }

  async cancelDeleteStudent() {
    await this.clickElement(DELETE_CANCEL_BTN);
    await this.waitForElementToDisappear(DELETE_DIALOG);
  }
}

export default new AlumnosPage();
