Feature: e2e tests: "TSM" page test suit. I as User checks the functionality of "Config" tab

  Background:
    Given user selects the "default" server

  @clearIndexedDb
  Scenario: Checking the selection config of the "BinanceSwap" MD Gate
    Given user goes to the "Trading Servers Manager" page with the backend server parameter
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user selects "BinanceSwap" component from "MD Gates" table
    And user sees the name "BinanceSwap" in the header of the "MD Gates" tables
    When user selects the "Config" tab on the "Trading Servers Manager" page
    Then user sees the "Config" tab in the "Trading Servers Manager" page


  @clearIndexedDb
  Scenario: Checking the icon display when editing the config
    Given user goes on the "Trading Servers Manager" page with selected "Config" tab of the "Herodotus" "Robot"
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user sees the "Config" tab in the "Trading Servers Manager" page
    And user not sees the active elements on the "Config" tab
    When user types a random value in the "Config" form
    And user sees the typed config value on the "Config" tab
    And user sees the active elements on the "Config" tab
    When user clicks on the "Discard" button in the "Config" form
    And user not sees the typed config value on the "Config" tab
    Then user not sees the active elements on the "Config" tab


  @clearIndexedDb
  Scenario Outline: Checking draft config saving with params: "<NameComponent>", "<NameKindComponent>"
    Given user goes on the "Trading Servers Manager" page with selected "Config" tab of the "BinanceSwap" "Gate"
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user sees the "Config" tab in the "Trading Servers Manager" page
    And user types a random value in the "Config" form
    When user selects "<NameComponent>" component from "<NameKindComponent>" table
    And user sees the "Config" tab in the "Trading Servers Manager" page
    And user selects "BinanceSwap" component from "MD Gates" table
    Then user sees the typed config value on the "Config" tab

    Examples:
      | NameComponent | NameKindComponent |
      | Herodotus     | Robots            |
      | Binance       | Exec Gates        |


  @clearIndexedDb
  Scenario: Checking the functionality revision list
    Given user goes on the "Trading Servers Manager" page with selected "Config" tab of the "BinanceSwap" "Gate"
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user sees the "Config" tab in the "Trading Servers Manager" page
    And user selects the "2023-08-31" revision from the config list revisions
    When user clicks on the revision selector and check that the last date is selected
    Then user sees a revisions list and the last revision


  @clearIndexedDb
  Scenario: Checking the functionality "Diff" button
    Given user goes on the "Trading Servers Manager" page with selected "Config" tab of the "Herodotus" "Robot"
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user sees the "Config" tab in the "Trading Servers Manager" page
    And user types a random value in the "Config" form
    And user clicks on the "Diff" switch button in the "Config" form
    When user sees the types random value in the "Edited config" form
    Then user not sees the types random value in the "Server config" form


  @clearIndexedDb
  Scenario: Checking visibly and selection revision list
    Given user goes on the "Trading Servers Manager" page with selected "Config" tab of the "BinanceSwap" "Gate"
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user sees the "Config" tab in the "Trading Servers Manager" page
    And user selects the "2023-08-30" revision from the config list revisions
    And user types a random value in the "Config" form
    And user sees the "2023-08-30" selected revision version
    And user sees the "configDigest" parameter in the URL
    And user clicks on the "Diff" switch button in the "Config" form
    When user selects the last revision from the config list revisions
    And user not sees the typed config value on the "Config" tab
    Then user not sees the "configDigest" parameter in the URL


  @clearIndexedDb
  Scenario: Checking reload config
    Given user goes on the "Config" page with "configDigest=9225843034473634522" param
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user sees the "2023-08-30" selected revision version
    When user reload a page
    Then user sees the "2023-08-30" selected revision version


  @clearIndexedDb
  Scenario Outline: Checking the config is saved after changing the component with params: "<NameComponent>", "<NameKindComponent>"
    Given user goes on the "Trading Servers Manager" page with selected "Config" tab of the "TestMdIndicator" "Robot"
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user sees the "Config" tab in the "Trading Servers Manager" page
    And user selects the "2023-10-22" revision from the config list revisions
    And user types a random value in the "Config" form
    And user selects "<NameComponent>" component from "<NameKindComponent>" table
    And user selects the "<Data>" revision from the config list revisions
    When user selects "TestMdIndicator" component from "Robots" table
    And user sees the typed config value on the "Config" tab
    Then user sees the "2023-10-22" selected revision version

    Examples:
      | NameComponent   | NameKindComponent | Data       |
      | BinanceCoinSwap | Exec Gates        | 2023-08-30 |
      | BinanceCoinSwap | MD Gates          | 2023-08-30 |


  @clearIndexedDb
  Scenario: Checking saving a new config revision
    Given user goes on the "Trading Servers Manager" page with selected "Config" tab of the "Herodotus" "Robot"
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user sees the "Config" tab in the "Trading Servers Manager" page
    And user sees the actual date in the revisions list
    And user types a random value in the "Config" form
    And user clicks on the "Apply" button in the "Config" form
    And user sees the typed config value on the "Config" tab
    When user sees the "Config for robot(817) updated" success message
    And user not sees the active elements on the "Config" tab
    And user sees the typed config value on the "Config" tab
    Then user checks that the actual date change on the "Config" tab


  @clearIndexedDb
  Scenario: Checking the config coloring after reload the page
    Given user goes on the "Trading Servers Manager" page with selected "Config" tab of the "BinanceSwap" "Gate"
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user sees the "Config" tab in the "Trading Servers Manager" page
    When user selects the "2023-08-30" revision from the config list revisions
    And user sees the "2023-08-30" selected revision version
    And user selects a "selectAll" value in the config
    And user sees the "configSelection" parameter in the URL
    When user reload a page
    And user sees the "2023-08-30" selected revision version
#    When user sees the selection indicator in the "Config" form https://bhft-company.atlassian.net/browse/FRT-2170
    And user selects "TestMdIndicator" component from "Robots" table
    And user selects "BinanceSwap" component from "MD Gates" table
    And user not sees the selection indicator in the "Config" form
    And the user clicks back button twice
    When user sees the "2023-08-30" selected revision version
#    Then user sees the selection indicator in the "Config" form https://bhft-company.atlassian.net/browse/FRT-2170


  @clearIndexedDb
  Scenario: Checking the config coloring after changed revision
    Given user goes on the "Trading Servers Manager" page with selected "Config" tab of the "Herodotus" "Robot"
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user sees the "Config" tab in the "Trading Servers Manager" page
    And user selects a "selectAll" value in the config
    And user sees the "configSelection" parameter in the URL
    And user reload a page
    When user sees the selection indicator in the "Config" form
    And user selects the previous date from the config list revisions
    Then user not sees the selection indicator in the "Config" form
    And user not sees the "configSelection" parameter in the URL


#  @clearIndexedDb wait https://bhft-company.atlassian.net/browse/FRT-2170
#  Scenario: Checking the config coloring after waiting "10" seconds
#    Given user goes on the "Trading Servers Manager" page with selected "Config" tab of the "Herodotus" "Robot"
#    And user sees the "Config" tab in the "Trading Servers Manager" page
#    And user selects the previous date from the config list revisions
#    And user selects a "selectAll" value in the config
#    And user sees the "configSelection" parameter in the URL
#    And user reload a page
#    When user sees the "Config" tab in the "Trading Servers Manager" page
#    And user waits for "10" seconds
#    And user sees the selection indicator in the "Config" form
#    Then user sees the selection indicator in the "Config" form