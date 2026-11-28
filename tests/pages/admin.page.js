const ADMIN_SIDEBAR = '[data-testid="admin-sidebar"]';
const DASHBOARD_GREETING = '[data-testid="dashboard-greeting"]';
const DASHBOARD_TITLE = '[data-testid="admin-dashboard-title"]';
const BEDS_GRID = '[data-testid="admin-beds-grid"]';
const NEXT_TURN_BANNER = '[data-testid="admin-next-turn-banner"]';
const PAYMENTS_SECTION = '[data-testid="admin-payments-section"]';
const PLACEHOLDER_SECTION = '[data-testid="admin-placeholder-section"]';
const PROFILE_SECTION = '[data-testid="admin-profile-section"]';
const PROFILE_TITLE = '[data-testid="admin-profile-title"]';
const PROFILE_PERSONAL_FORM = '[data-testid="admin-profile-personal-form"]';
const PROFILE_EMAIL_CARD = '[data-testid="customer-profile-email-card"]';
const PROFILE_GOOGLE_CARD = '[data-testid="customer-profile-google-card"]';
const PROFILE_SECURITY_CARD = '[data-testid="customer-profile-security-card"]';
const PROFILE_OPEN_PASSWORD_BTN = '[data-testid="customer-profile-open-password-modal-btn"]';
const CHANGE_PASSWORD_MODAL = '[data-testid="change-password-modal"]';
const CHANGE_PASSWORD_MODAL_TITLE = '[data-testid="change-password-modal-title"]';
const NOTICE_SECTION = '[data-testid="admin-notice-section"]';
const NOTICE_TITLE = '[data-testid="admin-notice-title"]';
const NOTICE_RECIPIENTS_SUMMARY = '[data-testid="admin-notice-recipients-summary"]';
const NOTICE_SUBJECT_INPUT = '[data-testid="admin-notice-subject-input"]';
const NOTICE_BODY_INPUT = '[data-testid="admin-notice-body-input"]';
const NOTICE_SUBMIT_BTN = '[data-testid="admin-notice-submit-btn"]';
const NOTICE_PREVIEW = '[data-testid="admin-notice-preview"]';

const NAV_ITEM_BY_SECTION = {
  dashboard: '[data-testid="admin-nav-dashboard"]',
  calendario: '[data-testid="admin-nav-calendario"]',
  alumnos: '[data-testid="admin-nav-alumnos"]',
  cobros: '[data-testid="admin-nav-cobros"]',
  precios: '[data-testid="admin-nav-precios"]',
  usuarios: '[data-testid="admin-nav-usuarios"]',
  avisos: '[data-testid="admin-nav-avisos"]',
  configuracion: '[data-testid="admin-nav-configuracion"]',
  perfil: '[data-testid="admin-nav-perfil"]',
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

  async isProfileSectionDisplayed() {
    const section = await $(PROFILE_SECTION);
    await section.waitForDisplayed();
    return section.isDisplayed();
  }

  async getProfileTitleText() {
    const title = await $(PROFILE_TITLE);
    await title.waitForDisplayed();
    return title.getText();
  }

  async areProfileCardsDisplayed() {
    const formDisplayed = await $(PROFILE_PERSONAL_FORM).isDisplayed();
    const emailDisplayed = await $(PROFILE_EMAIL_CARD).isDisplayed();
    const googleDisplayed = await $(PROFILE_GOOGLE_CARD).isDisplayed();
    const securityDisplayed = await $(PROFILE_SECURITY_CARD).isDisplayed();
    return formDisplayed && emailDisplayed && googleDisplayed && securityDisplayed;
  }

  async openChangePasswordModal() {
    const btn = await $(PROFILE_OPEN_PASSWORD_BTN);
    await btn.waitForClickable();
    await btn.click();
  }

  async isChangePasswordModalDisplayed() {
    const modal = await $(CHANGE_PASSWORD_MODAL);
    await modal.waitForDisplayed();
    return modal.isDisplayed();
  }

  async getChangePasswordModalTitle() {
    const title = await $(CHANGE_PASSWORD_MODAL_TITLE);
    await title.waitForDisplayed();
    return title.getText();
  }

  async isNoticeSectionDisplayed() {
    const section = await $(NOTICE_SECTION);
    await section.waitForDisplayed();
    return section.isDisplayed();
  }

  async getNoticeTitleText() {
    const title = await $(NOTICE_TITLE);
    await title.waitForDisplayed();
    return title.getText();
  }

  async areNoticeElementsDisplayed() {
    const checks = await Promise.all([
      $(NOTICE_RECIPIENTS_SUMMARY).isDisplayed(),
      $(NOTICE_SUBJECT_INPUT).isDisplayed(),
      $(NOTICE_BODY_INPUT).isDisplayed(),
      $(NOTICE_SUBMIT_BTN).isDisplayed(),
      $(NOTICE_PREVIEW).isDisplayed(),
    ]);
    return checks.every(Boolean);
  }
}

export default new AdminPage();
