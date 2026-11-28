const CUSTOMER_SIDEBAR = '[data-testid="customer-sidebar"]';
const HEADER_BADGE = '[data-testid="dashboard-header-badge"]';
const TURNS_SECTION = '[data-testid="customer-turns-section"]';
const CALENDAR_WEEK_GRID = '[data-testid="calendar-week-grid"]';
const UPCOMING_TURNS_SECTION = '[data-testid="customer-upcoming-turns"]';
const PLACEHOLDER_SECTION = '[data-testid="customer-placeholder-section"]';
const PLACEHOLDER_TITLE = '[data-testid="customer-placeholder-title"]';
const PLACEHOLDER_STATUS = '[data-testid="customer-placeholder-status"]';
const PACKAGES_SECTION = '[data-testid="customer-packages-section"]';
const PACKAGES_TITLE = '[data-testid="customer-packages-title"]';
const PACKAGES_GRID = '[data-testid="customer-packages-grid"]';
const INDIVIDUAL_PACKAGE_CARD = '[data-testid="customer-package-card-plan-individual"]';
const PAYMENTS_SECTION = '[data-testid="customer-payments-section"]';
const PAYMENTS_TITLE = '[data-testid="customer-payments-title"]';
const PAYMENTS_BANK_DETAILS = '[data-testid="customer-payments-bank-details"]';
const PAYMENTS_TABLE = '[data-testid="customer-payments-table"]';
const PAYMENTS_EMPTY = '[data-testid="customer-payments-empty"]';

const NAV_ITEM_BY_SECTION = {
  turnos: '[data-testid="customer-nav-turnos"]',
  paquetes: '[data-testid="customer-nav-paquetes"]',
  pagos: '[data-testid="customer-nav-pagos"]',
  historial: '[data-testid="customer-nav-historial"]',
  configuracion: '[data-testid="customer-nav-configuracion"]',
};

class CustomerPage {
  async isSidebarDisplayed() {
    const sidebar = await $(CUSTOMER_SIDEBAR);
    return sidebar.isDisplayed();
  }

  async getHeaderBadgeText() {
    const badge = await $(HEADER_BADGE);
    await badge.waitForDisplayed();
    return badge.getText();
  }

  async isTurnsCalendarDisplayed() {
    const section = await $(TURNS_SECTION);
    await section.waitForDisplayed();
    const grid = await $(CALENDAR_WEEK_GRID);
    await grid.waitForDisplayed();
    return grid.isDisplayed();
  }

  async isUpcomingTurnsDisplayed() {
    const upcoming = await $(UPCOMING_TURNS_SECTION);
    await upcoming.waitForDisplayed();
    return upcoming.isDisplayed();
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

  async isPackagesSectionDisplayed() {
    const section = await $(PACKAGES_SECTION);
    await section.waitForDisplayed();
    return section.isDisplayed();
  }

  async getPackagesTitleText() {
    const title = await $(PACKAGES_TITLE);
    await title.waitForDisplayed();
    return title.getText();
  }

  async isPackagesGridDisplayed() {
    const grid = await $(PACKAGES_GRID);
    await grid.waitForDisplayed();
    return grid.isDisplayed();
  }

  async isIndividualPackageCardDisplayed() {
    const card = await $(INDIVIDUAL_PACKAGE_CARD);
    await card.waitForDisplayed();
    return card.isDisplayed();
  }

  async isPaymentsSectionDisplayed() {
    const section = await $(PAYMENTS_SECTION);
    await section.waitForDisplayed();
    return section.isDisplayed();
  }

  async getPaymentsTitleText() {
    const title = await $(PAYMENTS_TITLE);
    await title.waitForDisplayed();
    return title.getText();
  }

  async isPaymentsBankDetailsDisplayed() {
    const details = await $(PAYMENTS_BANK_DETAILS);
    await details.waitForDisplayed();
    return details.isDisplayed();
  }

  async isPaymentsTableOrEmptyDisplayed() {
    await browser.waitUntil(
      async () =>
        (await $(PAYMENTS_TABLE).isDisplayed()) || (await $(PAYMENTS_EMPTY).isDisplayed()),
      {
        timeout: 10000,
        timeoutMsg: 'Expected either customer payments table or empty state to be displayed',
      }
    );
    return true;
  }
}

export default new CustomerPage();
