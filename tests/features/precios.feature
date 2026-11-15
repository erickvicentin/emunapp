@sanity-prices
Feature: Packages and Pricing Management in Administrator Panel
  As an Emuná Pilates administrator
  I want to manage class packages and prices
  So that students see updated tariffs and can receive class credits

  Background:
    Given the administrator logs in with valid credentials
    And the administrator navigates to the "precios" section from the sidebar

  @EMUNA-021
  Scenario: Display default packages and protect individual class package from deletion
    Then the packages section should be visible with title "Precios y Paquetes"
    And the create package button should be visible
    And the 4 default packages should be visible after loading
    And the "plan-individual" package should show its protected badge and disabled delete button

  @EMUNA-022
  Scenario: Open create package modal and validate required package name
    When the administrator clicks the create package button
    And the administrator submits the package form without a name
    Then the package modal should show error "El nombre del paquete es obligatorio."
