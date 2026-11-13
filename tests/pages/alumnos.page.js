const STUDENTS_SECTION = '[data-testid="students-section"]';
const STUDENTS_TITLE = '[data-testid="students-title"]';
const STUDENTS_COUNT_BADGE = '[data-testid="students-count-badge"]';
const EXPORT_BTN = '[data-testid="students-export-btn"]';
const CREATE_BTN = '[data-testid="students-create-btn"]';
const NOTICE_BANNER = '[data-testid="students-notice"]';
const STUDENTS_TABLE = '[data-testid="students-table"]';
const TABLE_HEADERS = '[data-testid="students-table"] thead th';
const TABLE_ROWS = '[data-testid="students-table"] tbody tr';
const DELETE_DIALOG = '[data-testid="student-delete-dialog"]';
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

class AlumnosPage {
  async waitForPageLoad() {
    await $(STUDENTS_SECTION).waitForDisplayed();
  }

  async isSectionDisplayed() {
    return $(STUDENTS_SECTION).isDisplayed();
  }

  async getTitleText() {
    const title = await $(STUDENTS_TITLE);
    await title.waitForDisplayed();
    return title.getText();
  }

  async getCountBadgeText() {
    const badge = await $(STUDENTS_COUNT_BADGE);
    await badge.waitForDisplayed();
    return badge.getText();
  }

  async isExportButtonDisplayed() {
    return $(EXPORT_BTN).isDisplayed();
  }

  async isCreateButtonDisplayed() {
    return $(CREATE_BTN).isDisplayed();
  }

  async clickCreateStudent() {
    const btn = await $(CREATE_BTN);
    await btn.waitForClickable();
    await btn.click();
  }

  async clickExportExcel() {
    const btn = await $(EXPORT_BTN);
    await btn.waitForClickable();
    await btn.click();
  }

  async isNoticeDisplayed() {
    const notice = await $(NOTICE_BANNER);
    await notice.waitForDisplayed();
    return notice.isDisplayed();
  }

  async getNoticeText() {
    const notice = await $(NOTICE_BANNER);
    await notice.waitForDisplayed();
    return notice.getText();
  }

  async isTableDisplayed() {
    return $(STUDENTS_TABLE).isDisplayed();
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
    const row = await $(getRowSelector(studentId));
    return row.isDisplayed();
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
    const viewDisplayed = await $(getViewBtnSelector(studentId)).isDisplayed();
    const editDisplayed = await $(getEditBtnSelector(studentId)).isDisplayed();
    const deleteDisplayed = await $(getDeleteBtnSelector(studentId)).isDisplayed();
    return viewDisplayed && editDisplayed && deleteDisplayed;
  }

  async clickViewStudent(studentId) {
    const btn = await $(getViewBtnSelector(studentId));
    await btn.waitForClickable();
    await btn.click();
  }

  async clickEditStudent(studentId) {
    const btn = await $(getEditBtnSelector(studentId));
    await btn.waitForClickable();
    await btn.click();
  }

  async clickDeleteStudent(studentId) {
    const btn = await $(getDeleteBtnSelector(studentId));
    await btn.waitForClickable();
    await btn.click();
  }

  async isDeleteDialogOpen() {
    const dialog = await $(DELETE_DIALOG);
    return dialog.isDisplayed();
  }

  async confirmDeleteStudent() {
    const confirmBtn = await $(DELETE_CONFIRM_BTN);
    await confirmBtn.waitForClickable();
    await confirmBtn.click();
    await $(DELETE_DIALOG).waitForDisplayed({ reverse: true });
  }

  async cancelDeleteStudent() {
    const cancelBtn = await $(DELETE_CANCEL_BTN);
    await cancelBtn.waitForClickable();
    await cancelBtn.click();
    await $(DELETE_DIALOG).waitForDisplayed({ reverse: true });
  }
}

export default new AlumnosPage();
