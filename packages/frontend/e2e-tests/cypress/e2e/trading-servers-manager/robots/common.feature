Feature: e2e tests: "TSM" page test suit. I as User checks the functionality of robot tab

  Background:
    Given user selects the "default" server

  @clearIndexedDb
  Scenario: Checking the selection of the "Herodotus" robot
    Given user goes to the "Trading Servers Manager" page with the backend server parameter
    And user sees the "Authorization" page and logs in as a "Frontend" user
    When user selects "HerodotusMultiEdit" component from "Robots" table
    Then user sees the name "HerodotusMultiEdit" in the header of the "Robots" tables


  @clearIndexedDb
  Scenario Outline: "Herodotus" robot. "Dashboards" tab. Checking the functionality filter of the filter by name "<Name>"
    Given user goes on the "Trading Servers Manager" page with selected "Dashboards" tab of the "HerodotusMultiEdit" "Robot"
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user sees the "Dashboards" tab in the "Trading Servers Manager" page
    When user types "<Name>" in the input field
    Then user sees "<Name>" dashboard name in the table

    Examples:
      | Name     |
      | T0092    |
      | USDT     |
      | 15_USDT  |


  @clearIndexedDb
  Scenario: "Herodotus" robot. "Dashboards" tab. Checking open the "Dashboard" tab
    Given user goes on the "Trading Servers Manager" page with selected "Dashboards" tab of the "HerodotusMultiEdit" "Robot"
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user sees the "Dashboards" tab in the "Trading Servers Manager" page
    And user types "T0015_USDT" in the input field
    When user clicks the "T0015_USDT" dashboard name in the table
    Then user sees the new "T0015_USDT" tab


  @clearIndexedDb
  Scenario: "Herodotus" robot. "Dashboards" tab. Checking the functionality of the "Select data" input
    Given user goes on the "Trading Servers Manager" page with selected "Dashboards" tab of the "HerodotusMultiEdit" "Robot"
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user sees the "Dashboards" tab in the "Trading Servers Manager" page
    And user waits for "5" seconds
    And user clicks on the table header "Update time" twice
    And user waits for "10" seconds
    When user types the first "Dashboard" in the input field
    And user sets "Update time" in the "Data" input
    And user sees a new "Update time" in the table
    Then user sees the "Update time" less the "Data" in the input field


  @clearIndexedDb
  Scenario: Checking that there is a notice "No Rows To Show" in the "Dashboards" tab
    Given user goes on the "Trading Servers Manager" page with selected "Dashboards" tab of the "HerodotusMultiEdit" "Robot"
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user sees the "Dashboards" tab in the "Trading Servers Manager" page
    When user types "X?@/Y" in the input field
    Then user sees "No Rows To Show" in the table

