import { When, Then } from '@wdio/cucumber-framework';
import { expect } from '@wdio/globals';
import StaffPage from '../pages/staff.page.js';

Then(
  'the staff section should be visible with title {string}',
  async (expectedTitle) => {
    await StaffPage.waitForPageLoad();
    expect(await StaffPage.isSectionDisplayed()).toBe(true);
    expect(await StaffPage.getTitleText()).toBe(expectedTitle);
    expect(await StaffPage.isCountBadgeDisplayed()).toBe(true);
  }
);

Then(
  'the "Crear usuario staff" button should be visible and the export button should not exist',
  async () => {
    expect(await StaffPage.isCreateButtonDisplayed()).toBe(true);
    expect(await StaffPage.isExportButtonDisplayed()).toBe(false);
  }
);

Then('the staff search bar should be visible', async () => {
  expect(await StaffPage.isSearchBarDisplayed()).toBe(true);
  expect(await StaffPage.isSearchInputDisplayed()).toBe(true);
});

Then('the staff list or empty state should finish loading', async () => {
  await StaffPage.waitForStaffLoaded();
  expect(await StaffPage.isTableOrEmptyDisplayed()).toBe(true);
});

When('the administrator clicks the create staff user button', async () => {
  await StaffPage.clickCreateStaff();
});

Then(
  'the staff creation page should be visible with title {string}',
  async (expectedTitle) => {
    await StaffPage.waitForCreatePageLoad();
    expect(await StaffPage.isCreateSectionDisplayed()).toBe(true);
    expect(await StaffPage.getCreateTitleText()).toBe(expectedTitle);
  }
);

Then('the staff activation notice should be visible', async () => {
  expect(await StaffPage.isCreateNoticeDisplayed()).toBe(true);
});

When('the administrator submits the new staff form', async () => {
  await StaffPage.submitCreateForm();
});

Then(
  'the staff creation form should show validation error {string}',
  async (expectedError) => {
    const isVisible = await StaffPage.isCreateSectionTextVisible(expectedError);
    expect(isVisible).toBe(true);
  }
);
