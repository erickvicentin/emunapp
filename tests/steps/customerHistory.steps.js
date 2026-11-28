import { Then } from '@wdio/cucumber-framework';
import CustomerHistoryPage from '../pages/customerHistory.page.js';

const customerHistoryPage = new CustomerHistoryPage();

Then('the customer history section should be visible with title {string}', async (expectedTitle) => {
  await customerHistoryPage.waitForSection();
  const title = await customerHistoryPage.getSectionTitle();
  expect(title).toBe(expectedTitle);
});

Then('the customer attendance percentage card should be visible', async () => {
  const visible = await customerHistoryPage.isAttendanceCardVisible();
  expect(visible).toBe(true);
  const percentage = await customerHistoryPage.getAttendancePercentageText();
  expect(percentage).toMatch(/^\d+%$/);
});

Then('the customer history list or empty state should be displayed', async () => {
  const displayed = await customerHistoryPage.hasTableOrEmptyState();
  expect(displayed).toBe(true);
});
