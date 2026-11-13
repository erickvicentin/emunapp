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
  Scenario: View details and edit student show upcoming feature notice
    When the administrator clicks the view icon for student "alu-1"
    Then an inline notice should display "Próximamente: detalle del alumno Sofía Martínez."
    When the administrator clicks the edit icon for student "alu-1"
    Then an inline notice should display "Próximamente: editar datos de Sofía Martínez."

  @EMUNA-007
  Scenario: Delete a student after confirming in the modal dialog
    When the administrator clicks the delete icon for student "alu-8"
    Then the delete confirmation dialog should be open with irreversible warning
    When the administrator confirms the student deletion
    Then a "success" snackbar should appear indicating deletion succeeded
    And the students table should display "7" registered students
    And the row for student "alu-8" should no longer exist in the table

  @EMUNA-008
  Scenario Outline: Search students by name, surname, DNI, or email
    Then the students search bar should be visible
    When the administrator searches for "<query>" in the students search bar
    Then the students table should display "<count>" matching rows
    And the row for student "<studentId>" should be visible in the table

    Examples:
      | query                    | count | studentId |
      | Sofia                    | 1     | alu-1     |
      | Echeverria               | 1     | alu-4     |
      | 35876112                 | 1     | alu-3     |
      | julian.sosa@emuna.com    | 1     | alu-7     |

  @EMUNA-009
  Scenario: Display empty state when search has no matching students
    When the administrator searches for "usuario-inexistente-999" in the students search bar
    Then the empty search results state should be visible

  @EMUNA-010
  Scenario: Clear search restores the full students list
    When the administrator searches for "Lucia" in the students search bar
    Then the students table should display "1" matching rows
    When the administrator clicks the "Limpiar" search button
    Then the students search input should be empty
    And the students table should display "8" matching rows

  @EMUNA-011
  Scenario: Navigate to new student registration page and validate required fields
    When the administrator clicks the "Crear alumno" button
    Then the student creation page should be visible with title "Registrar nuevo alumno"
    And the student activation notice should be visible
    When the administrator submits the new student form
    Then the student creation form should show validation error "El nombre es obligatorio."

  @EMUNA-012
  Scenario: Show error snackbar when Firebase Cloud Functions backend is unavailable during creation
    When the administrator clicks the "Crear alumno" button
    Then the student creation page should be visible with title "Registrar nuevo alumno"
    When the administrator completes the new student form with valid data
    And the administrator submits the new student form
    Then an "error" snackbar should appear with the error message
