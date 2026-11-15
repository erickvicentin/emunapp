Feature: Calendar and Shifts Management in Administrator Panel
  As an Emuná Pilates administrator
  I want to manage the weekly Monday-to-Sunday schedule, shifts, and base template
  So that classes and 4-bed capacities are accurately tracked

  Background:
    Given the administrator logs in with valid credentials
    And the administrator navigates to the "calendario" section from the sidebar

  @EMUNA-023
  Scenario: Display weekly calendar grid from Monday to Sunday with action buttons
    Then the calendar section should be visible with title "Calendario y Turnos"
    And the calendar action buttons and week range should be visible
    And the weekly calendar grid should display 7 day columns after loading

  @EMUNA-024
  Scenario: Open base weekly schedule modal as administrator
    When the administrator clicks the base schedule button
    Then the base schedule modal should be visible with title "Grilla Semanal Recurrente"

  @EMUNA-025
  Scenario: Display day dropdown, add-slot button, and save button inside base weekly schedule modal
    When the administrator clicks the base schedule button
    Then the base schedule modal should display the day dropdown, add slot button, and save changes button
