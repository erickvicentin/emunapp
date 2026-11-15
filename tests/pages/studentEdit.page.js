import BasePage from './base.page.js';

const EDIT_SECTION = '[data-testid="student-edit-section"]';
const EDIT_TITLE = '[data-testid="student-edit-title"]';
const NOMBRE_INPUT = '[data-testid="register-nombre-input"]';
const APELLIDO_INPUT = '[data-testid="register-apellido-input"]';
const TELEFONO_INPUT = '[data-testid="register-telefono-input"]';
const DNI_INPUT = '[data-testid="student-form-dni-input"]';
const SUBMIT_BTN = '[data-testid="student-edit-submit-btn"]';
const CANCEL_BTN = '[data-testid="student-edit-cancel-btn"]';

class StudentEditPage extends BasePage {
  async waitForPageLoad() {
    await this.waitForElement(EDIT_SECTION);
  }

  async isSectionDisplayed() {
    return this.isElementDisplayed(EDIT_SECTION);
  }

  async getTitleText() {
    return this.getElementText(EDIT_TITLE);
  }

  async updateFields({ nombre, apellido, telefono, dni }) {
    if (nombre !== undefined) {
      await this.typeValue(NOMBRE_INPUT, nombre);
    }
    if (apellido !== undefined) {
      await this.typeValue(APELLIDO_INPUT, apellido);
    }
    if (telefono !== undefined) {
      await this.typeValue(TELEFONO_INPUT, telefono);
    }
    if (dni !== undefined) {
      await this.typeValue(DNI_INPUT, dni);
    }
  }

  async clickSubmit() {
    await this.clickElement(SUBMIT_BTN);
  }

  async clickCancel() {
    await this.clickElement(CANCEL_BTN);
  }
}

export default new StudentEditPage();
