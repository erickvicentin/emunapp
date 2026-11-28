import BasePage from './base.page.js';

const PACKAGES_SECTION = '[data-testid="packages-section"]';
const PACKAGES_TITLE = '[data-testid="packages-title"]';
const PACKAGES_CREATE_BTN = '[data-testid="packages-create-btn"]';
const PACKAGES_SKELETON = '[data-testid="packages-loading-skeleton"]';
const PACKAGES_GRID = '[data-testid="packages-grid"]';

const PACKAGE_FORM_DIALOG = '[data-testid="package-form-dialog"]';
const PACKAGE_FORM_SUBMIT_BTN = '[data-testid="package-form-submit-btn"]';

const getCardSelector = (id) => `[data-testid="package-card-${id}"]`;
const getProtectedBadgeSelector = (id) =>
  `[data-testid="package-protected-badge-${id}"]`;
const getDeleteBtnSelector = (id) => `[data-testid="package-delete-btn-${id}"]`;

class PackagesPage extends BasePage {
  async waitForPageLoad() {
    await this.waitForElement(PACKAGES_SECTION);
  }

  async waitForPackagesLoaded(timeout = 10000) {
    await browser.waitUntil(
      async () => {
        const skeleton = await $(PACKAGES_SKELETON);
        if (await skeleton.isExisting()) return false;
        const grid = await $(PACKAGES_GRID);
        return grid.isDisplayed();
      },
      {
        timeout,
        timeoutMsg: 'Expected packages grid to finish loading',
      }
    );
  }

  async getTitleText() {
    return this.getElementText(PACKAGES_TITLE);
  }

  async isCreateButtonDisplayed() {
    return this.isElementDisplayed(PACKAGES_CREATE_BTN);
  }

  async isPackageCardDisplayed(packageId) {
    return this.isElementDisplayed(getCardSelector(packageId));
  }

  async isProtectedBadgeDisplayed(packageId) {
    return this.isElementDisplayed(getProtectedBadgeSelector(packageId));
  }

  async isDeleteButtonEnabled(packageId) {
    const btn = await this.waitForElement(getDeleteBtnSelector(packageId));
    return btn.isEnabled();
  }

  async clickCreatePackage() {
    await this.clickElement(PACKAGES_CREATE_BTN);
    await this.waitForElement(PACKAGE_FORM_DIALOG);
  }

  async submitPackageForm() {
    await this.clickElement(PACKAGE_FORM_SUBMIT_BTN);
  }

  async isPackageFormTextVisible(text) {
    const content = await this.getElementText(PACKAGE_FORM_DIALOG);
    return content.includes(text);
  }
}

export default new PackagesPage();
