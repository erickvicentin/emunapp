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
    And the customer upcoming turns section should be visible

  @EMUNA-102
  Scenario Outline: Customer sidebar navigation updates URL and displays placeholder
    When the customer navigates to the "<section>" section from the sidebar
    Then the customer URL should contain "<path>"
    And the customer placeholder section should show title "<title>" and status "Próximo a implementar"

    Examples:
      | section       | path                    | title               |
      | historial     | /customer/historial     | Historial de Clases |
      | configuracion | /customer/configuracion | Configuración       |

  @EMUNA-103
  Scenario: Customer can view available credit packages including individual class
    When the customer navigates to the "paquetes" section from the sidebar
    Then the customer URL should contain "/customer/paquetes"
    And the customer packages section should display title "Paquetes" and the individual package card

  @EMUNA-104
  Scenario: Customer can view payment history section
    When the customer navigates to the "pagos" section from the sidebar
    Then the customer URL should contain "/customer/pagos"
    And the customer payments section should display title "Pagos" and the history view
