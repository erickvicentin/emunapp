import BasePage from './base.page.js';

const CREATE_SECTION = '[data-testid="student-create-section"]';
const CREATE_TITLE = '[data-testid="student-create-title"]';
const BACK_BTN = '[data-testid="student-create-back-btn"]';
const NOMBRE_INPUT = '[data-testid="register-nombre-input"]';
const APELLIDO_INPUT = '[data-testid="register-apellido-input"]';
const TELEFONO_INPUT = '[data-testid="register-telefono-input"]';
const FECHA_NACIMIENTO_INPUT = '[data-testid="register-fecha-nacimiento-input"]';
const GENERO_SELECT = '[data-testid="register-genero-select"]';
const DNI_INPUT = '[data-testid="student-create-dni-input"]';
const EMAIL_INPUT = '[data-testid="student-create-email-input"]';
const ACTIVATION_NOTICE = '[data-testid="student-create-activation-notice"]';
const CANCEL_BTN = '[data-testid="student-create-cancel-btn"]';
const SUBMIT_BTN = '[data-testid="student-create-submit-btn"]';

class StudentCreatePage extends BasePage {
  async waitForPageLoad() {
    await this.waitForElement(CREATE_SECTION);
  }

  async isSectionDisplayed() {
    return this.isElementDisplayed(CREATE_SECTION);
  }

  async getTitleText() {
    return this.getElementText(CREATE_TITLE);
  }

  async isActivationNoticeDisplayed() {
    return this.isElementDisplayed(ACTIVATION_NOTICE);
  }

  async getActivationNoticeText() {
    return this.getElementText(ACTIVATION_NOTICE);
  }

  async fillStudentForm({
    nombre,
    apellido,
    telefono,
    fechaNacimiento,
    genero,
    dni,
    email,
  }) {
    if (nombre !== undefined) {
      await this.typeValue(NOMBRE_INPUT, nombre);
    }
    if (apellido !== undefined) {
      await this.typeValue(APELLIDO_INPUT, apellido);
    }
    if (telefono !== undefined) {
      await this.typeValue(TELEFONO_INPUT, telefono);
    }
    if (fechaNacimiento !== undefined) {
      await this.setDateValue(FECHA_NACIMIENTO_INPUT, fechaNacimiento);
    }
    if (genero !== undefined) {
      await this.selectOptionByValue(GENERO_SELECT, genero);
    }
    if (dni !== undefined) {
      await this.typeValue(DNI_INPUT, dni);
    }
    if (email !== undefined) {
      await this.typeValue(EMAIL_INPUT, email);
    }
  }

  async setDateValue(selector, isoDate) {
    const element = await this.waitForElement(selector);
    await browser.execute(
      (el, value) => {
        const nativeSetter = Object.getOwnPropertyDescriptor(
          window.HTMLInputElement.prototype,
          'value'
        ).set;
        nativeSetter.call(el, value);
        el.dispatchEvent(new Event('input', { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
      },
      element,
      isoDate
    );
  }

  async clickSubmit() {
    await this.clickElement(SUBMIT_BTN);
  }

  async clickCancel() {
    await this.clickElement(CANCEL_BTN);
  }

  async clickBack() {
    await this.clickElement(BACK_BTN);
  }

  async isSectionTextVisible(text) {
    const content = await this.getElementText(CREATE_SECTION);
    return content.includes(text);
  }
}

export default new StudentCreatePage();
