Feature: e2e tests: "TSM" page test suit. I as User checks the functionality of "Order Book" tab

  Background:
    Given user selects the "default" server

  @clearIndexedDb
  Scenario: Checking the selection of the "Order Book" tab
    Given user goes to the "Trading Servers Manager" page with the backend server parameter
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user sees the name "Servers" in the header
    When user selects the "Order Book" tab on the "Trading Servers Manager" page
    Then user sees the "Order Book" tab in the "Trading Servers Manager" page