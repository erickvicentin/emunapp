import { When, Then } from '@wdio/cucumber-framework';
import { expect } from '@wdio/globals';
import CobrosPage from '../pages/cobros.page.js';

Then(
  'the cobros section should be visible with title {string}',
  async (expectedTitle) => {
    await CobrosPage.waitForPageLoad();
    expect(await CobrosPage.getTitleText()).toBe(expectedTitle);
  }
);

Then('the cobros filter tabs should be visible', async () => {
  expect(await CobrosPage.isFilterTabsDisplayed()).toBe(true);
});

Then(
  'the admin configuration section should display cobros, studio settings, and email notification toggles',
  async () => {
    expect(await CobrosPage.isAdminConfigSectionDisplayed()).toBe(true);
    expect(await CobrosPage.isConfigCardDisplayed()).toBe(true);
    expect(await CobrosPage.areAccountConfigFieldsDisplayed()).toBe(true);
    expect(await CobrosPage.areAdminEmailNotificationTogglesDisplayed()).toBe(true);
  }
);

When('the administrator clicks the register cash payment button', async () => {
  await CobrosPage.waitForPageLoad();
  await CobrosPage.openCashNoticeModal();
});

Then('the cash payment notice modal should be visible', async () => {
  expect(await CobrosPage.isCashNoticeModalDisplayed()).toBe(true);
});
