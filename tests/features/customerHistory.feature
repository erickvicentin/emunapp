@sanity-customer-history
Feature: Customer Class History and Attendance Percentage
  As an Emuná Pilates student (alumna)
  I want to view my past confirmed classes and my attendance percentage
  So that I can track my participation and attendance history

  Background:
    Given the customer logs in with valid credentials
    And the customer navigates to the "historial" section from the sidebar

  @EMUNA-115
  Scenario: Display class history section and attendance percentage card
    Then the customer history section should be visible with title "Historial de Clases"
    And the customer attendance percentage card should be visible
    And the customer history list or empty state should be displayed
