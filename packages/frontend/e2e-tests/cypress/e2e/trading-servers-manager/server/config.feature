Feature: e2e tests: "TSM" page test suit. I as User checks the functionality of "Config" tab

  Background:
    Given user selects the "default" server

  @clearIndexedDb
  Scenario: Checking the selection of the "BinanceSwap" MD Gates
    Given user goes to the "Trading Servers Manager" page with the backend server parameter
    And user selects "BinanceSwap" component from "MD Gates" table
    And user sees the name "BinanceSwap" in the header of the "MD Gates" tables
    When user selects the "Config" tab
    Then user sees the "Config" tab


  @clearIndexedDb
  Scenario: Checking config editing and visible icons save config
    Given user goes on the "Config" tab of the "BinanceSwap" "Gate"
    And user sees the "Config" tab
    And user not sees the active elements on the "Config" tab
    When user types a random value in the config
    Then user sees the active elements on the "Config" tab


  @clearIndexedDb
  Scenario Outline: Checking draft config saving with params: "<NameComponent>", "<NameKindComponent>"
    Given user goes on the "Config" tab of the "BinanceSwap" "Gate"
    And user sees the "Config" tab
    And user types a random value in the config
    When user selects "<NameComponent>" component from "<NameKindComponent>" table
    And user sees the "Config" tab
    And user selects "BinanceSwap" component from "MD Gates" table
    Then user sees the typed config value on the "Config" tab

    Examples:
      | NameComponent | NameKindComponent |
      | Herodotus     | Robots            |
      | Binance       | Exec Gates        |


  @clearIndexedDb
  Scenario: Checking working "Diff" button
    Given user goes on the "Config" tab of the "BinanceSwap" "Gate"
    And user sees the "Config" tab
    And user selects the "2023-08-31" revision from the list revisions
    When user clicks on the revision selector and check that the last date is selected
    Then user sees a revisions list and the last revision


  @clearIndexedDb
  Scenario: Checking visibly and selection revision list
    Given user goes on the "Config" tab of the "BinanceSwap" "Gate"
    And user sees the "Config" tab
    And user selects the "2023-08-30" revision from the list revisions
    And user types a random value in the config
    And user sees the "2023-08-30" selected revision version
    And user sees the "configDigest" parameter in the URL
    And clicks on the draft button
    When user selects the last revision
    And user not sees the typed config value on the "Config" tab
    Then user not sees the "configDigest" parameter in the URL


  @clearIndexedDb
  Scenario: Checking reload config
    Given user goes on the "Config" page with "configDigest=9225843034473634522" param
    And user sees the "2023-08-30" selected revision version
    When user reload a page
    Then user sees the "2023-08-30" selected revision version


  @clearIndexedDb
  Scenario Outline: Checking the selection revision with params: "<NameComponent>", "<NameKindComponent>"
    Given user goes on the "Config" tab of the "TestMdIndicator" "Robot"
    And user sees the "Config" tab
    And user selects the "2023-10-22" revision from the list revisions
    And user types a random value in the config
    And user selects "<NameComponent>" component from "<NameKindComponent>" table
    And user selects the "<Data>" revision from the list revisions
    When user selects "TestMdIndicator" component from "Robots" table
    And user sees the typed config value on the "Config" tab
    Then user sees the "2023-10-22" selected revision version

    Examples:
      | NameComponent   | NameKindComponent | Data       |
      | BinanceCoinSwap | Exec Gates        | 2023-08-30 |
      | BinanceCoinSwap | MD Gates          | 2023-08-30 |


  @clearIndexedDb
  Scenario: Checking saving a new revision
    Given user goes on the "Config" tab of the "Herodotus" "Robot"
    And user sees the "Config" tab
    And user sees the actual date in the revisions list
    And user types a random value in the config for save
    And user clicks a Apply button
    And user sees the typed config value on the "Config" tab
    When user sees the "Config updated successfully for trading_tasks(Herodotus)" success message
    And user not sees the active elements on the "Config" tab
    And user sees the typed config value on the "Config" tab
    Then user checks that the actual date change


  @clearIndexedDb
  Scenario: Checking the selection revision
    Given user goes on the "Config" tab of the "BinanceSwap" "Gate"
    And user sees the "Config" tab
    And user selects the "2023-08-30" revision from the list revisions
    And user selects a "selectAll" value in the config
    And user reload a page
    And user sees the "2023-08-30" selected revision version
    And user sees the selection indicator
    And user selects "TestMdIndicator" component from "Robots" table
    And user selects "BinanceSwap" component from "MD Gates" table
    And user not sees the selection indicator
    And the user clicks back button twice
    When user sees the "2023-08-30" selected revision version
    Then user sees the selection indicator

