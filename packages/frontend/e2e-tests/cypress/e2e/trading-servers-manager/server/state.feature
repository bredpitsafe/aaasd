Feature: e2e tests: "TSM" page test suit. I as User checks the functionality of "State" tab

  Background:
    Given user selects the "default" server

  @clearIndexedDb
  Scenario: Checking the selection state of the "FXProvider" Robot
    Given user goes to the "Trading Servers Manager" page with the backend server parameter
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user selects "FXProvider" component from "Robots" table
    And user sees the name "FXProvider" in the header of the "Robots" tables
    When user selects the "State" tab on the "Trading Servers Manager" page
    Then user sees the "State" tab in the "Trading Servers Manager" page


  @clearIndexedDb
  Scenario: Checking the icon display when editing the state
    Given user goes on the "Trading Servers Manager" page with selected "State" tab of the "FXProvider" "Robot"
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user sees the "State" tab in the "Trading Servers Manager" page
    And user not sees the active elements on the "State" tab
    When user types a random value in the "State" form
    And user sees the active elements on the "State" tab
    And user sees the typed state value on the "State" tab
    When user clicks on the "Discard" button in the "State" form
    And user not sees the typed state value on the "State" tab
    Then user not sees the active elements on the "State" tab


  @clearIndexedDb
  Scenario Outline: Checking draft state saving with params: "<NameComponent>", "<NameKindComponent>"
    Given user goes on the "Trading Servers Manager" page with selected "State" tab of the "FXProvider" "Robot"
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user sees the "State" tab in the "Trading Servers Manager" page
    And user types a random value in the "State" form
    And user sees the typed state value on the "State" tab
    When user selects "<NameComponent>" component from "<NameKindComponent>" table
    And user sees the "State" tab in the "Trading Servers Manager" page
    And user selects "FXProvider" component from "Robots" table
    Then user sees the typed state value on the "State" tab

    Examples:
      | NameComponent         | NameKindComponent |
      | HerodotusMultiUnblock | Robots            |
      | Binance               | Exec Gates        |


  @clearIndexedDb
  Scenario: Checking the functionality "Diff" button
    Given user goes on the "Trading Servers Manager" page with selected "State" tab of the "FXProvider" "Robot"
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user sees the "State" tab in the "Trading Servers Manager" page
    And user types a random value in the "State" form
    And user clicks on the "Diff" switch button in the "State" form
    When user sees the types random value in the "Edited state" form
    Then user not sees the types random value in the "Server state" form


  @clearIndexedDb
  Scenario: Checking visibly and selection revision list
    Given user goes on the "Trading Servers Manager" page with selected "State" tab of the "FXProvider" "Robot"
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user sees the "State" tab in the "Trading Servers Manager" page
    And user selects the previous date from the state list revisions
    And user types a random value in the "State" form
    And user clicks on the "Diff" switch button in the "State" form
    When user selects the last revision from the state list revisions
    Then user not sees the typed state value on the "State" tab


#  @clearIndexedDb // wait https://bhft-company.atlassian.net/browse/FRT-2333
#  Scenario: Checking reload state
#    Given user goes on the "State" page with "&stateEditor=2024-05-09T00%3A07%3A36.056464005Z" param
#    And user sees the "2024-05-09" selected revision version
#    When user reload a page
#    Then user sees the "2024-05-09" selected revision version


  @clearIndexedDb
  Scenario: Checking the state is saved after changing the component
    Given user goes on the "Trading Servers Manager" page with selected "State" tab of the "FXProvider" "Robot"
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user sees the "State" tab in the "Trading Servers Manager" page
    And user selects the previous date from the state list revisions
    And user types a random value in the "State" form
    And user selects "StateSaveRobot" component from "Robots" table
    And user selects the previous date from the state list revisions
    When user selects "FXProvider" component from "Robots" table
    And user sees the typed state value on the "State" tab
    Then user sees the selected previous date in the revision list


  @clearIndexedDb
  Scenario: Checking saving a new state revision
    Given user goes on the "Trading Servers Manager" page with selected "State" tab of the "StateSaveRobot" "Robot"
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user sees the "State" tab in the "Trading Servers Manager" page
    And user "stops" the "StateSaveRobot" Robot
    And user sees the actual date in the revisions list on the "State" tab
    And user clear types a random state value in the "State" form
    And user clicks on the "Apply" button in the "State" form
    When user sees the types random value in the "State" form
    And user not sees the active elements on the "State" tab
    Then user checks that the actual date change on the "State" tab


#  @clearIndexedDb // wait https://bhft-company.atlassian.net/browse/FRT-2333
#  Scenario: Checking the config coloring after reload the page
#    Given user goes on the "State" tab of the "StateSaveRobot" "Robot"
#    And user sees the "State" tab in the "Trading Servers Manager" page
#    And user selects a "selectAll" value in the state
#    And user sees the "stateSelection" parameter in the URL
#    When user reload a page
#    And user sees the selection indicator in the "State" form
#    And user selects "StateSaveRobot" component from "Robots" table
#    And user selects "BinanceSwap" component from "MD Gates" table
#    And user not sees the selection indicator in the "State" form
#    And the user clicks back button twice
#    Then user sees the selection indicator in the "State" form
#
#
#  @clearIndexedDb // wait https://bhft-company.atlassian.net/browse/FRT-2333
#  Scenario: Checking the selection revision
#    Given user goes on the "State" tab of the "StateSaveRobot" "Robot"
#    And user sees the "State" tab in the "Trading Servers Manager" page
#    And user selects a "selectAll" value in the state
#    And user sees the "stateSelection" parameter in the URL
#    And user reload a page
#    When user sees the selection indicator in the "State" form
#    And user selects the previous date from the state list revisions
#    Then user not sees the selection indicator in the "State" form