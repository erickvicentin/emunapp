const ADMIN_SIDEBAR = '[data-testid="admin-sidebar"]';
const DASHBOARD_GREETING = '[data-testid="dashboard-greeting"]';
const DASHBOARD_TITLE = '[data-testid="admin-dashboard-title"]';
const BEDS_GRID = '[data-testid="admin-beds-grid"]';
const NEXT_TURN_BANNER = '[data-testid="admin-next-turn-banner"]';
const PAYMENTS_SECTION = '[data-testid="admin-payments-section"]';
const PLACEHOLDER_SECTION = '[data-testid="admin-placeholder-section"]';

const NAV_ITEM_BY_SECTION = {
  dashboard: '[data-testid="admin-nav-dashboard"]',
  calendario: '[data-testid="admin-nav-calendario"]',
  alumnos: '[data-testid="admin-nav-alumnos"]',
  cobros: '[data-testid="admin-nav-cobros"]',
  precios: '[data-testid="admin-nav-precios"]',
  usuarios: '[data-testid="admin-nav-usuarios"]',
  configuracion: '[data-testid="admin-nav-configuracion"]',
};

const getBedCardSelector = (bedId) => `[data-testid="admin-bed-card-${bedId}"]`;
const getBedCheckinBtnSelector = (bedId) =>
  `[data-testid="admin-bed-checkin-btn-${bedId}"]`;

class AdminPage {
  async isSidebarDisplayed() {
    const sidebar = await $(ADMIN_SIDEBAR);
    return sidebar.isDisplayed();
  }

  async getDashboardTitleText() {
    const title = await $(DASHBOARD_TITLE);
    await title.waitForDisplayed();
    return title.getText();
  }

  async getGreetingText() {
    const greeting = await $(DASHBOARD_GREETING);
    await greeting.waitForDisplayed();
    return greeting.getText();
  }

  async isBedsGridDisplayed() {
    await browser.waitUntil(
      async () =>
        (await $(BEDS_GRID).isDisplayed()) ||
        (await $(NEXT_TURN_BANNER).isDisplayed()),
      {
        timeout: 15000,
        timeoutMsg: 'Expected either active beds grid or next turn banner to be displayed',
      }
    );
    return true;
  }

  async isPaymentsSectionDisplayed() {
    const section = await $(PAYMENTS_SECTION);
    return section.isDisplayed();
  }

  async isPlaceholderSectionDisplayed() {
    const section = await $(PLACEHOLDER_SECTION);
    return section.isDisplayed();
  }

  async navigateToSection(sectionId) {
    const selector = NAV_ITEM_BY_SECTION[sectionId];
    if (!selector) {
      throw new Error(`Sección de menú desconocida: ${sectionId}`);
    }
    const navLink = await $(selector);
    await navLink.waitForClickable();
    await navLink.click();
  }

  async getCurrentUrl() {
    return browser.getUrl();
  }

  async toggleBedCheckin(bedId) {
    const btn = await $(getBedCheckinBtnSelector(bedId));
    await btn.waitForClickable();
    await btn.click();
  }

  async getBedCardText(bedId) {
    const card = await $(getBedCardSelector(bedId));
    await card.waitForDisplayed();
    return card.getText();
  }
}

export default new AdminPage();
