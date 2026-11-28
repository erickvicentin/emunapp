Feature: Payments Reconciliation and Transfer Account Configuration in Administrator Panel
  As an Emuná Pilates administrator
  I want to configure the destination transfer account details and manage payment notices
  So that provisional 24h credits and manual collections stay reconciled

  Background:
    Given the administrator logs in with valid credentials
    And the administrator navigates to the "cobros" section from the sidebar

  @EMUNA-026
  Scenario: Display Cobros section with filter tabs
    Then the cobros section should be visible with title "Cobros y Conciliación"
    And the cobros filter tabs should be visible

  @EMUNA-027
  Scenario: Open cash payment notice modal as administrator
    When the administrator clicks the register cash payment button
    Then the cash payment notice modal should be visible

  @EMUNA-028
  Scenario: Display destination account, studio settings, and bulk email notice in Configuracion
    When the administrator navigates to the "configuracion" section from the sidebar
    Then the admin configuration section should display cobros, studio settings, and bulk email button
