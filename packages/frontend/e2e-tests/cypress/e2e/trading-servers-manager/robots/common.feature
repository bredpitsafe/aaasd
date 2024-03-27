Feature: e2e tests: "TSM" page test suit. I as User checks the functionality of robot tab

  Background:
    Given user selects the "default" server

  @clearIndexedDb
  Scenario: Checking the selection of the "Herodotus" robot
    Given user goes to the "Trading Servers Manager" page with the backend server parameter
    When user selects "HerodotusMulti" component from "Robots" table
    Then user sees the name "HerodotusMulti" in the header of the "Robots" tables


  @clearIndexedDb
  Scenario: "Herodotus" robot. Checking the selection "Dashboards" tab
    Given user goes on the "Trading Servers Manager" page with the selected "HerodotusMulti" in the "Robots" table
    When user selects the "Dashboards" tab
    Then user sees the "Dashboards" tab


  @clearIndexedDb
  Scenario Outline: "Herodotus" robot. "Dashboards" tab. Checking the functionality filter of the filter by name "<Name>"
    Given user goes on the "Dashboards" tab of the "HerodotusMulti" "Robot"
    And user sees the "Dashboards" tab
    When user types "<Name>" in the input field
    Then user sees "<Name>" dashboard name in the table

    Examples:
      | Name     |
      | T2993    |
      | USDT     |
      | 18_USDT  |


  @clearIndexedDb
  Scenario: "Herodotus" robot. "Dashboards" tab. Checking open the "Dashboard" tab
    Given user goes on the "Dashboards" tab of the "HerodotusMulti" "Robot"
    And user sees the "Dashboards" tab
    And user types "T3018_USDT" in the input field
    When user clicks the "T3018_USDT" dashboard name in the table
    Then user sees the new "T3018_USDT" tab


  @clearIndexedDb
  Scenario: "Herodotus" robot. "Dashboards" tab. Checking the functionality of the "Select data" input
    Given user goes on the "Dashboards" tab of the "HerodotusMulti" "Robot"
    And user sees the "Dashboards" tab
    And user waits for "5" seconds
    And user clicks on the table header "Update time" twice
    And user waits for "10" seconds
    When user types the first "Dashboard" in the input field
    And user sets "Update time" in the "Data" input
    And user sees a new "Update time" in the table
    Then user sees the "Update time" less the "Data" in the input field


  @clearIndexedDb
  Scenario Outline: Checking that there is a notice "No Rows To Show" in the "<NameTab>" tab
    Given user goes on the "<NameTab>" tab of the "HerodotusMulti" "Robot"
    And user selects the "<NameTab>" tab
    And user sees the "<NameTab>" tab
    When user types "X?@/Y" in the input field
    Then user sees "No Rows To Show" in the table

    Examples:
      | NameTab        |
      | Dashboards     |

