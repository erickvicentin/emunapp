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

Then(
  'the customer URL should contain {string}',
  async (expectedPath) => {
    const currentUrl = await CustomerPage.getCurrentUrl();
    expect(currentUrl).toContain(expectedPath);
  }
);

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
