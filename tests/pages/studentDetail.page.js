import BasePage from './base.page.js';

const DETAIL_SECTION = '[data-testid="student-detail-section"]';
const DETAIL_TITLE = '[data-testid="student-detail-title"]';
const DETAIL_NAME = '[data-testid="student-detail-name"]';
const DETAIL_AVATAR = '[data-testid="student-detail-avatar"]';
const DETAIL_EMAIL = '[data-testid="student-detail-email"]';
const DETAIL_BACK_BTN = '[data-testid="student-detail-back-btn"]';
const DETAIL_EDIT_BTN = '[data-testid="student-detail-edit-btn"]';

class StudentDetailPage extends BasePage {
  async waitForPageLoad() {
    await this.waitForElement(DETAIL_SECTION);
  }

  async isSectionDisplayed() {
    return this.isElementDisplayed(DETAIL_SECTION);
  }

  async getTitleText() {
    return this.getElementText(DETAIL_TITLE);
  }

  async getStudentNameText() {
    return this.getElementText(DETAIL_NAME);
  }

  async getEmailText() {
    return this.getElementText(DETAIL_EMAIL);
  }

  async getAvatarFallbackIconName() {
    const avatar = await this.waitForElement(DETAIL_AVATAR);
    return avatar.getText();
  }

  async clickBack() {
    await this.clickElement(DETAIL_BACK_BTN);
  }

  async clickEdit() {
    await this.clickElement(DETAIL_EDIT_BTN);
  }
}

export default new StudentDetailPage();
