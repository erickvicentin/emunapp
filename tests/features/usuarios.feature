Feature: Staff Users Management in Administrator Panel
  As an Emuná Pilates administrator
  I want to view and manage staff users
  So that only administrators can create, edit, deactivate, or delete staff accounts

  Background:
    Given the administrator logs in with valid credentials
    And the administrator navigates to the "usuarios" section from the sidebar

  @EMUNA-016
  Scenario: Display staff section with header, search bar, and loaded table or empty state
    Then the staff section should be visible with title "Usuarios (staff)"
    And the "Crear usuario staff" button should be visible and the export button should not exist
    And the staff search bar should be visible
    And the staff list or empty state should finish loading

  @EMUNA-017
  Scenario: Navigate to new staff registration page and validate required fields
    When the administrator clicks the create staff user button
    Then the staff creation page should be visible with title "Registrar usuario staff"
    And the staff activation notice should be visible
    When the administrator submits the new staff form
    Then the staff creation form should show validation error "El nombre es obligatorio."
