import { Given, Then, When } from '@wdio/cucumber-framework';
import ChatbotPage from '../pages/chatbot.page.js';

const chatbotPage = new ChatbotPage();

Given('the visitor is on the landing page', async () => {
  await chatbotPage.openLanding();
});

When('the visitor opens the virtual assistant drawer', async () => {
  await chatbotPage.openDrawer();
});

Then('the virtual assistant drawer should be visible', async () => {
  const visible = await chatbotPage.isDrawerVisible();
  expect(visible).toBe(true);
});

Then('3 suggested preset questions should be visible', async () => {
  const count = await chatbotPage.getPresetsCount();
  expect(count).toBe(3);
});

When('the visitor clicks the first quick preset question', async () => {
  await chatbotPage.clickFirstPreset();
});

Then('the virtual assistant should append the user question and an instant reply', async () => {
  const count = await chatbotPage.getMessageBubblesCount();
  expect(count).toBeGreaterThanOrEqual(3);
});

When('the visitor closes the virtual assistant drawer', async () => {
  await chatbotPage.closeDrawer();
});

Then('the virtual assistant drawer should not be visible', async () => {
  const visible = await chatbotPage.isDrawerVisible();
  expect(visible).toBe(false);
});
