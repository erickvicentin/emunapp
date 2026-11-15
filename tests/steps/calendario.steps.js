import { When, Then } from '@wdio/cucumber-framework';
import { expect } from '@wdio/globals';
import CalendarPage from '../pages/calendar.page.js';

Then(
  'the calendar section should be visible with title {string}',
  async (expectedTitle) => {
    await CalendarPage.waitForPageLoad();
    expect(await CalendarPage.getTitleText()).toBe(expectedTitle);
  }
);

Then('the calendar action buttons and week range should be visible', async () => {
  expect(await CalendarPage.isWeekRangeDisplayed()).toBe(true);
  expect(await CalendarPage.isBaseScheduleButtonDisplayed()).toBe(true);
  expect(await CalendarPage.isAddTurnButtonDisplayed()).toBe(true);
});

Then(
  'the weekly calendar grid should display {int} day columns after loading',
  async (expectedCount) => {
    await CalendarPage.waitForCalendarLoaded();
    expect(await CalendarPage.getDayColumnsCount()).toBe(expectedCount);
  }
);

When('the administrator clicks the base schedule button', async () => {
  await CalendarPage.waitForCalendarLoaded();
  await CalendarPage.openBaseScheduleModal();
});

Then(
  'the base schedule modal should be visible with title {string}',
  async (expectedTitle) => {
    expect(await CalendarPage.getBaseScheduleModalTitle()).toBe(expectedTitle);
  }
);

Then(
  'the base schedule modal should display the day dropdown, add slot button, and save changes button',
  async () => {
    expect(await CalendarPage.isBaseDaySelectDisplayed()).toBe(true);
    expect(await CalendarPage.isBaseAddSlotButtonDisplayed()).toBe(true);
    expect(await CalendarPage.isBaseApplyButtonDisplayed()).toBe(true);
  }
);
