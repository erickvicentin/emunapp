@sanity-administrator
Feature: Administrator Panel
  As an Emuná Pilates administrator
  I want to access the administration panel and navigate through its sections
  To manage the studio room and operational modules

  Background:
    Given the administrator logs in with valid credentials

  @EMUNA-001
  Scenario: Display general admin dashboard on login
    Then the admin sidebar should be visible
    And the beds grid and pending payments section should be visible
    And the current URL should contain "/administrador/dashboard"

  @EMUNA-002
  Scenario Outline: Sidebar navigation updates the URL path
    When the administrator navigates to the "<section>" section from the sidebar
    Then the current URL should contain "<path>"

    Examples:
      | section    | path                      |
      | dashboard  | /administrador/dashboard  |
      | calendario | /administrador/calendario |
      | alumnos    | /administrador/alumnos    |
      | cobros     | /administrador/cobros     |
      | precios       | /administrador/precios       |
      | usuarios      | /administrador/usuarios      |
      | avisos        | /administrador/avisos        |
      | configuracion | /administrador/configuracion |
      | perfil        | /administrador/perfil        |

  @EMUNA-003
  Scenario: Display time-of-day greeting in admin header
    Then the dashboard header should display a time-of-day greeting

  @EMUNA-004
  Scenario: Administrator can view Mi perfil section and open change password modal
    When the administrator navigates to the "perfil" section from the sidebar
    Then the current URL should contain "/administrador/perfil"
    And the admin profile section should display title "Mi perfil" with personal, email, Google, and security cards
    When the administrator opens the change password modal
    Then the admin change password modal should be visible with title "Cambiar contraseña"

  @EMUNA-035
  Scenario: Administrator can view Emitir aviso section with subject, body, and live preview
    When the administrator navigates to the "avisos" section from the sidebar
    Then the current URL should contain "/administrador/avisos"
    And the admin notice section should display title "Emitir aviso", recipient summary, form fields, and email preview
