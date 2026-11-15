import { When, Then } from '@wdio/cucumber-framework';
import { expect } from '@wdio/globals';
import PackagesPage from '../pages/packages.page.js';

Then(
  'the packages section should be visible with title {string}',
  async (expectedTitle) => {
    await PackagesPage.waitForPageLoad();
    expect(await PackagesPage.getTitleText()).toBe(expectedTitle);
  }
);

Then('the create package button should be visible', async () => {
  expect(await PackagesPage.isCreateButtonDisplayed()).toBe(true);
});

Then('the 4 default packages should be visible after loading', async () => {
  await PackagesPage.waitForPackagesLoaded();
  expect(await PackagesPage.isPackageCardDisplayed('plan-individual')).toBe(true);
  expect(await PackagesPage.isPackageCardDisplayed('plan-4')).toBe(true);
  expect(await PackagesPage.isPackageCardDisplayed('plan-8')).toBe(true);
  expect(await PackagesPage.isPackageCardDisplayed('plan-12')).toBe(true);
});

Then(
  'the {string} package should show its protected badge and disabled delete button',
  async (packageId) => {
    expect(await PackagesPage.isProtectedBadgeDisplayed(packageId)).toBe(true);
    expect(await PackagesPage.isDeleteButtonEnabled(packageId)).toBe(false);
  }
);

When('the administrator clicks the create package button', async () => {
  await PackagesPage.waitForPackagesLoaded();
  await PackagesPage.clickCreatePackage();
});

When('the administrator submits the package form without a name', async () => {
  await PackagesPage.submitPackageForm();
});

Then('the package modal should show error {string}', async (expectedError) => {
  expect(await PackagesPage.isPackageFormTextVisible(expectedError)).toBe(true);
});
