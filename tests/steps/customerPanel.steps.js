import { Given, When, Then } from '@wdio/cucumber-framework';
import { expect } from '@wdio/globals';
import LoginPage from '../pages/login.page.js';
import CustomerPage from '../pages/customer.page.js';

Given('the customer logs in with valid credentials', async () => {
  const email = process.env.CUSTOMER_USER;
  const password = process.env.CUSTOMER_PASS;

  if (!email || !password) {
    throw new Error(
      'Missing CUSTOMER_USER or CUSTOMER_PASS credentials in the .env file'
    );
  }

  await LoginPage.loginAsCustomer(email, password);
});

When(
  'the customer navigates to the {string} section from the sidebar',
  async (section) => {
    await CustomerPage.navigateToSection(section);
  }
);

Then('the customer sidebar should be visible', async () => {
  const isDisplayed = await CustomerPage.isSidebarDisplayed();
  expect(isDisplayed).toBe(true);
});

Then('the customer header should display the credits badge', async () => {
  const badgeText = await CustomerPage.getHeaderBadgeText();
  expect(badgeText.toUpperCase()).toContain('CRÉDITOS:');
});

Then(
  'the customer URL should contain {string}',
  async (expectedPath) => {
    const currentUrl = await CustomerPage.getCurrentUrl();
    expect(currentUrl).toContain(expectedPath);
  }
);

Then('the customer turns calendar should be visible', async () => {
  const isDisplayed = await CustomerPage.isTurnsCalendarDisplayed();
  expect(isDisplayed).toBe(true);
});

Then('the customer upcoming turns section should be visible', async () => {
  const isDisplayed = await CustomerPage.isUpcomingTurnsDisplayed();
  expect(isDisplayed).toBe(true);
});

Then(
  'the customer placeholder section should show title {string} and status {string}',
  async (expectedTitle, expectedStatus) => {
    const isDisplayed = await CustomerPage.isPlaceholderSectionDisplayed();
    const titleText = await CustomerPage.getPlaceholderTitleText();
    const statusText = await CustomerPage.getPlaceholderStatusText();

    expect(isDisplayed).toBe(true);
    expect(titleText).toContain(expectedTitle);
    expect(statusText).toContain(expectedStatus);
  }
);

Then(
  'the customer packages section should display title {string} and the individual package card',
  async (expectedTitle) => {
    const isDisplayed = await CustomerPage.isPackagesSectionDisplayed();
    const titleText = await CustomerPage.getPackagesTitleText();
    const isGridDisplayed = await CustomerPage.isPackagesGridDisplayed();
    const isIndividualDisplayed = await CustomerPage.isIndividualPackageCardDisplayed();

    expect(isDisplayed).toBe(true);
    expect(titleText).toContain(expectedTitle);
    expect(isGridDisplayed).toBe(true);
    expect(isIndividualDisplayed).toBe(true);
  }
);

Then(
  'the customer payments section should display title {string} and the history view',
  async (expectedTitle) => {
    const isDisplayed = await CustomerPage.isPaymentsSectionDisplayed();
    const titleText = await CustomerPage.getPaymentsTitleText();
    const isBankDisplayed = await CustomerPage.isPaymentsBankDetailsDisplayed();
    const isViewDisplayed = await CustomerPage.isPaymentsTableOrEmptyDisplayed();

    expect(isDisplayed).toBe(true);
    expect(titleText).toContain(expectedTitle);
    expect(isBankDisplayed).toBe(true);
    expect(isViewDisplayed).toBe(true);
  }
);

Then(
  'the customer profile section should display title {string} with personal, email, Google, and security cards',
  async (expectedTitle) => {
    const isDisplayed = await CustomerPage.isProfileSectionDisplayed();
    const titleText = await CustomerPage.getProfileTitleText();
    const cardsDisplayed = await CustomerPage.areProfileCardsDisplayed();

    expect(isDisplayed).toBe(true);
    expect(titleText).toContain(expectedTitle);
    expect(cardsDisplayed).toBe(true);
  }
);

When('the customer opens the change password modal', async () => {
  await CustomerPage.openChangePasswordModal();
});

Then(
  'the change password modal should be visible with title {string}',
  async (expectedTitle) => {
    const isDisplayed = await CustomerPage.isChangePasswordModalDisplayed();
    const titleText = await CustomerPage.getChangePasswordModalTitleText();

    expect(isDisplayed).toBe(true);
    expect(titleText).toContain(expectedTitle);
  }
);
