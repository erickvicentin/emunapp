import { Given, When, Then } from '@wdio/cucumber-framework';
import { expect } from '@wdio/globals';
import AuthRecoveryPage from '../pages/authRecovery.page.js';

Given('the user is on the login page', async () => {
  await AuthRecoveryPage.openLogin();
});

When('the user clicks the forgot password link', async () => {
  await AuthRecoveryPage.clickForgotPasswordLink();
});

Then(
  'the forgot password page should be visible with title {string}',
  async (expectedTitle) => {
    expect(await AuthRecoveryPage.getForgotTitleText()).toBe(expectedTitle);
  }
);

When('the user submits the forgot password form without entering an email', async () => {
  await AuthRecoveryPage.submitForgotForm();
});

Then(
  'the forgot password card should show error {string}',
  async (expectedError) => {
    expect(await AuthRecoveryPage.isForgotCardTextVisible(expectedError)).toBe(true);
  }
);

When('the user opens the auth action page without a code', async () => {
  await AuthRecoveryPage.openAuthAction();
  await AuthRecoveryPage.waitForInvalidActionCard();
});

Then('the invalid auth action card should be visible', async () => {
  expect(await AuthRecoveryPage.isInvalidActionCardDisplayed()).toBe(true);
});

When('the user clicks to request a new password reset link', async () => {
  await AuthRecoveryPage.clickRequestNewLink();
});

Given('the user is on the registration page', async () => {
  await AuthRecoveryPage.openRegister();
});

When('the user types {string} into the registration password field', async (pwd) => {
  await AuthRecoveryPage.typeRegisterPassword(pwd);
});

Then(
  'the registration password rule {string} should be {string}',
  async (ruleId, expectedValid) => {
    const valid = await AuthRecoveryPage.getRegisterRuleValidity(ruleId);
    expect(valid).toBe(expectedValid);
  }
);
