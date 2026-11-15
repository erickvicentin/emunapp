Feature: Password Recovery, Reset Action, and Password Strength Rules
  As an Emuná Pilates user
  I want to recover my password, handle password action links, and see clear password rules
  So that I can activate or reset my account securely

  @EMUNA-018
  Scenario: Navigate to forgot password page from login and validate email input
    Given the user is on the login page
    When the user clicks the forgot password link
    Then the forgot password page should be visible with title "Recuperar contraseña"
    When the user submits the forgot password form without entering an email
    Then the forgot password card should show error "El correo electrónico es obligatorio."

  @EMUNA-019
  Scenario: Display invalid link state on auth action page without valid code
    When the user opens the auth action page without a code
    Then the invalid auth action card should be visible
    When the user clicks to request a new password reset link
    Then the forgot password page should be visible with title "Recuperar contraseña"

  @EMUNA-020
  Scenario: Live password strength checklist validates length, uppercase, lowercase, and number on registration
    Given the user is on the registration page
    When the user types "abc" into the registration password field
    Then the registration password rule "length" should be "false"
    And the registration password rule "uppercase" should be "false"
    And the registration password rule "lowercase" should be "true"
    And the registration password rule "number" should be "false"
    When the user types "Emuna2026" into the registration password field
    Then the registration password rule "length" should be "true"
    And the registration password rule "uppercase" should be "true"
    And the registration password rule "lowercase" should be "true"
    And the registration password rule "number" should be "true"
