const CUSTOMER_SIDEBAR = '[data-testid="customer-sidebar"]';
const PLACEHOLDER_SECTION = '[data-testid="customer-placeholder-section"]';
const PLACEHOLDER_TITLE = '[data-testid="customer-placeholder-title"]';
const PLACEHOLDER_STATUS = '[data-testid="customer-placeholder-status"]';

const NAV_ITEM_BY_SECTION = {
  turnos: '[data-testid="customer-nav-turnos"]',
  pagos: '[data-testid="customer-nav-pagos"]',
  historial: '[data-testid="customer-nav-historial"]',
  configuracion: '[data-testid="customer-nav-configuracion"]',
};

class CustomerPage {
  async isSidebarDisplayed() {
    const sidebar = await $(CUSTOMER_SIDEBAR);
    return sidebar.isDisplayed();
  }

  async isPlaceholderSectionDisplayed() {
    const section = await $(PLACEHOLDER_SECTION);
    await section.waitForDisplayed();
    return section.isDisplayed();
  }

  async getPlaceholderTitleText() {
    const title = await $(PLACEHOLDER_TITLE);
    await title.waitForDisplayed();
    return title.getText();
  }

  async getPlaceholderStatusText() {
    const status = await $(PLACEHOLDER_STATUS);
    await status.waitForDisplayed();
    return status.getText();
  }

  async navigateToSection(sectionId) {
    const selector = NAV_ITEM_BY_SECTION[sectionId];
    if (!selector) {
      throw new Error(`Unknown customer menu section: ${sectionId}`);
    }
    const navLink = await $(selector);
    await navLink.waitForClickable();
    await navLink.click();
  }

  async getCurrentUrl() {
    return browser.getUrl();
  }
}

export default new CustomerPage();
