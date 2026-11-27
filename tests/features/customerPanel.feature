@sanity-customer
Feature: Customer Panel Navigation
  As an Emuná Pilates student (alumna)
  I want to access my personal panel and navigate through the sidebar sections
  To view Turnos, Pagos, Historial de Clases, and Configuración

  Background:
    Given the customer logs in with valid credentials

  @EMUNA-101
  Scenario: Display customer sidebar and weekly Turnos calendar on login
    Then the customer sidebar should be visible
    And the customer header should display the credits badge
    And the customer URL should contain "/customer/turnos"
    And the customer turns calendar should be visible

  @EMUNA-102
  Scenario Outline: Customer sidebar navigation updates URL and displays placeholder
    When the customer navigates to the "<section>" section from the sidebar
    Then the customer URL should contain "<path>"
    And the customer placeholder section should show title "<title>" and status "Próximo a implementar"

    Examples:
      | section       | path                    | title               |
      | pagos         | /customer/pagos         | Pagos               |
      | historial     | /customer/historial     | Historial de Clases |
      | configuracion | /customer/configuracion | Configuración       |
