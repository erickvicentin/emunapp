import BasePage from './base.page.js';

const CHATBOT_TOGGLE_BTN = '[data-testid="chatbot-toggle-btn"]';
const CHATBOT_DRAWER = '[data-testid="chatbot-drawer"]';
const CHATBOT_CLOSE_BTN = '[data-testid="chatbot-close-btn"]';
const CHATBOT_PRESETS = '[data-testid="chatbot-presets"] button';
const CHATBOT_PRESET_FIRST = '[data-testid="chatbot-preset-0"]';
const CHATBOT_MESSAGES = '[data-testid="chatbot-messages"] > div';

export default class ChatbotPage extends BasePage {
  async openLanding() {
    await this.openUrl('/');
    await this.waitForElement(CHATBOT_TOGGLE_BTN);
  }

  async openDrawer() {
    await this.clickElement(CHATBOT_TOGGLE_BTN);
    await this.waitForElement(CHATBOT_DRAWER);
  }

  async closeDrawer() {
    await this.clickElement(CHATBOT_CLOSE_BTN);
    await this.waitForElementToDisappear(CHATBOT_DRAWER);
  }

  async getPresetsCount() {
    const elements = await $$(CHATBOT_PRESETS);
    return elements.length;
  }

  async clickFirstPreset() {
    await this.clickElement(CHATBOT_PRESET_FIRST);
  }

  async isDrawerVisible() {
    return this.isElementDisplayed(CHATBOT_DRAWER);
  }

  async getMessageBubblesCount() {
    const bubbles = await $$(CHATBOT_MESSAGES);
    return bubbles.length;
  }
}
