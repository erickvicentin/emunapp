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
      | precios    | /administrador/precios    |
      | usuarios   | /administrador/usuarios   |

  @EMUNA-003
  Scenario: Toggle bed check-in status on the dashboard
    When the administrator toggles the check-in status of bed "1"
    Then bed card "1" should display the status "AUSENTE"
