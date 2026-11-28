@sanity-chatbot
Feature: Landing Page Virtual Assistant
  As a visitor on the Emuná Pilates landing page
  I want to open the virtual assistant and consult studio policies
  So that I can get immediate answers about cancellations, location, packages, and bookings

  @EMUNA-045
  Scenario: Open virtual assistant drawer and get instant answer from suggested preset
    Given the visitor is on the landing page
    When the visitor opens the virtual assistant drawer
    Then the virtual assistant drawer should be visible
    And 3 suggested preset questions should be visible
    When the visitor clicks the first quick preset question
    Then the virtual assistant should append the user question and an instant reply
    When the visitor closes the virtual assistant drawer
    Then the virtual assistant drawer should not be visible
