import BasePage from './base.page.js';

const CALENDAR_SECTION = '[data-testid="calendar-section"]';
const CALENDAR_TITLE = '[data-testid="calendar-title"]';
const CALENDAR_WEEK_RANGE = '[data-testid="calendar-week-range"]';
const CALENDAR_BASE_BTN = '[data-testid="calendar-base-schedule-btn"]';
const CALENDAR_ADD_TURN_BTN = '[data-testid="calendar-add-turn-btn"]';
const CALENDAR_SKELETON = '[data-testid="calendar-loading-skeleton"]';
const CALENDAR_GRID = '[data-testid="calendar-week-grid"]';
const DAY_COLUMNS = '[data-testid^="calendar-day-col-"]';

const BASE_SCHEDULE_DIALOG = '[data-testid="base-schedule-dialog"]';
const BASE_SCHEDULE_TITLE = '[data-testid="base-schedule-title"]';
const BASE_DAY_SELECT = '[data-testid="base-day-select"]';
const BASE_ADD_SLOT_BTN = '[data-testid="base-add-slot-btn"]';
const BASE_APPLY_BTN = '[data-testid="base-schedule-apply-btn"]';

class CalendarPage extends BasePage {
  async waitForPageLoad() {
    await this.waitForElement(CALENDAR_SECTION);
  }

  async waitForCalendarLoaded(timeout = 20000) {
    await browser.waitUntil(
      async () => {
        const skeleton = await $(CALENDAR_SKELETON);
        if (await skeleton.isExisting()) return false;
        const grid = await $(CALENDAR_GRID);
        return grid.isDisplayed();
      },
      {
        timeout,
        timeoutMsg: 'Expected weekly calendar grid to finish loading',
      }
    );
  }

  async getTitleText() {
    return this.getElementText(CALENDAR_TITLE);
  }

  async isWeekRangeDisplayed() {
    return this.isElementDisplayed(CALENDAR_WEEK_RANGE);
  }

  async isBaseScheduleButtonDisplayed() {
    return this.isElementDisplayed(CALENDAR_BASE_BTN);
  }

  async isAddTurnButtonDisplayed() {
    return this.isElementDisplayed(CALENDAR_ADD_TURN_BTN);
  }

  async getDayColumnsCount() {
    const cols = await $$(DAY_COLUMNS);
    return cols.length;
  }

  async openBaseScheduleModal() {
    await this.clickElement(CALENDAR_BASE_BTN);
    await this.waitForElement(BASE_SCHEDULE_DIALOG);
  }

  async getBaseScheduleModalTitle() {
    return this.getElementText(BASE_SCHEDULE_TITLE);
  }

  async isBaseDaySelectDisplayed() {
    return this.isElementDisplayed(BASE_DAY_SELECT);
  }

  async isBaseAddSlotButtonDisplayed() {
    return this.isElementDisplayed(BASE_ADD_SLOT_BTN);
  }

  async isBaseApplyButtonDisplayed() {
    return this.isElementDisplayed(BASE_APPLY_BTN);
  }
}

export default new CalendarPage();
