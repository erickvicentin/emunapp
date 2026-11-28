import { Given, When, Then } from '@wdio/cucumber-framework';
import { expect } from '@wdio/globals';
import LoginPage from '../pages/login.page.js';
import AdminPage from '../pages/admin.page.js';

Given('the administrator logs in with valid credentials', async () => {
  const email = process.env.ADM_USER;
  const password = process.env.ADM_PASS;

  if (!email || !password) {
    throw new Error(
      'Missing ADM_USER or ADM_PASS credentials in the .env file'
    );
  }

  await LoginPage.loginAsAdmin(email, password);
});

When(
  'the administrator navigates to the {string} section from the sidebar',
  async (section) => {
    await AdminPage.navigateToSection(section);
  }
);

When(
  'the administrator toggles the check-in status of bed {string}',
  async (bedId) => {
    await AdminPage.toggleBedCheckin(bedId);
  }
);

Then('the admin sidebar should be visible', async () => {
  const isDisplayed = await AdminPage.isSidebarDisplayed();
  expect(isDisplayed).toBe(true);
});

Then(
  'the beds grid and pending payments section should be visible',
  async () => {
    const titleText = await AdminPage.getDashboardTitleText();
    const bedsVisible = await AdminPage.isBedsGridDisplayed();
    const paymentsVisible = await AdminPage.isPaymentsSectionDisplayed();

    expect(titleText).toContain('Matriz de Sala');
    expect(bedsVisible).toBe(true);
    expect(paymentsVisible).toBe(true);
  }
);

Then('the current URL should contain {string}', async (expectedPath) => {
  const currentUrl = await AdminPage.getCurrentUrl();
  expect(currentUrl).toContain(expectedPath);
});

Then('the dashboard header should display a time-of-day greeting', async () => {
  const greetingText = await AdminPage.getGreetingText();
  expect(greetingText).toMatch(/^(Buenos días|Buenas tardes|Buenas noches)\s+\S+/);
});

Then(
  'the admin profile section should display title {string} with personal, email, Google, and security cards',
  async (expectedTitle) => {
    const isDisplayed = await AdminPage.isProfileSectionDisplayed();
    const titleText = await AdminPage.getProfileTitleText();
    const cardsDisplayed = await AdminPage.areProfileCardsDisplayed();

    expect(isDisplayed).toBe(true);
    expect(titleText).toBe(expectedTitle);
    expect(cardsDisplayed).toBe(true);
  }
);

When('the administrator opens the change password modal', async () => {
  await AdminPage.openChangePasswordModal();
});

Then(
  'the admin change password modal should be visible with title {string}',
  async (expectedTitle) => {
    const isDisplayed = await AdminPage.isChangePasswordModalDisplayed();
    const titleText = await AdminPage.getChangePasswordModalTitle();

    expect(isDisplayed).toBe(true);
    expect(titleText).toBe(expectedTitle);
  }
);
