Feature: Students Management in Administrator Panel
  As an Emuná Pilates administrator
  I want to view and manage the list of registered students
  To administer their information regardless of packages or class enrollments

  Background:
    Given the administrator logs in with valid credentials
    And the administrator navigates to the "alumnos" section from the sidebar

  @EMUNA-004
  Scenario: Display students table with required columns and header buttons
    Then the students section should be visible with title "Alumnos"
    And the "Crear alumno" and "Exportar plantilla como Excel" buttons should be visible
    And the students table should be visible with all required columns
    And the students table should display "8" registered students

  @EMUNA-005
  Scenario: Display complete student data and action icons per row
    Then the row for student "alu-1" should display complete student details
    And the row for student "alu-1" should display the view, edit, and delete action icons

  @EMUNA-006
  Scenario: Create, view details, and edit student show upcoming feature notice
    When the administrator clicks the "Crear alumno" button
    Then an inline notice should display "Próximamente: pantalla para crear un nuevo alumno."
    When the administrator clicks the view icon for student "alu-1"
    Then an inline notice should display "Próximamente: detalle del alumno Sofía Martínez."
    When the administrator clicks the edit icon for student "alu-1"
    Then an inline notice should display "Próximamente: editar datos de Sofía Martínez."

  @EMUNA-007
  Scenario: Delete a student after confirming in the modal dialog
    When the administrator clicks the delete icon for student "alu-8"
    Then the delete confirmation dialog should be open
    When the administrator confirms the student deletion
    Then the students table should display "7" registered students
    And the row for student "alu-8" should no longer exist in the table
