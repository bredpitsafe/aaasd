Feature: e2e tests: "TSM" page test suit. I as User checks the functionality of "Robot Positions" tap

  Background:
    Given user selects the "default" server

  @clearIndexedDb
  Scenario: Checking the selection of the "Robot Positions" tab
    Given user goes to the "Trading Servers Manager" page with the backend server parameter
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user selects "test_rpc_robot" component from "Robots" table
    When user selects the "Robot Positions" tab on the "Trading Servers Manager" page
    Then user sees the "Robot Positions" tab in the "Trading Servers Manager" page


  @clearIndexedDb
  Scenario: Checking that there is a notice "No Rows To Show" with the "Instrument filter" in the "Robot Positions" tab
    Given user goes on the "Trading Servers Manager" page with selected "Robot Positions" tab of the "test_rpc_robot" "Robot"
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user sees the "Robot Positions" tab in the "Trading Servers Manager" page
    When user sets "108 BinanceSwap|BTCUSDT" in the "Instrument filter" on the "Robot Positions" tab
    Then user sees "No Rows To Show" in the table


  @clearIndexedDb
  Scenario: Checking the sets of the "Instrument filter" in the "Robot Positions" tab
    Given user goes on the "Trading Servers Manager" page with selected "Robot Positions" tab of the "test_rpc_robot" "Robot"
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user sees the "Robot Positions" tab in the "Trading Servers Manager" page
    And user sets "2187808 Deribit|BTC-PERPETUAL" in the "Instrument filter" on the "Robot Positions" tab
    When user sees "2187808" in the "Instrument ID" columns in the table
    Then user sees "BTC-PERPETUAL|Deribit" in the "Instrument" columns in the table


  @clearIndexedDb
  Scenario: Checking the resets of the "Instrument filter" in the "Robot Positions" tab
    Given user goes on the "Trading Servers Manager" page with selected "Robot Positions" tab of the "test_rpc_robot" "Robot"
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user sees the "Robot Positions" tab in the "Trading Servers Manager" page
    And user sets "108 BinanceSwap|BTCUSDT" in the "Instrument filter" on the "Robot Positions" tab
    And user sees "No Rows To Show" in the table
    When user resets the "Instrument filter" on the "Robot Positions" tab
    Then user not sees a selects "Instrument" in the "Instrument filter" on the "Robot Positions" tab
    And user not sees "No Rows To Show" in the table


  @clearIndexedDb
  Scenario: Checking the visible warning after selects the "Instrument filter" in the "Robot Positions" tab
    Given user goes on the "Trading Servers Manager" page with selected "Robot Positions" tab of the "test_rpc_robot" "Robot"
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user sees the "Robot Positions" tab in the "Trading Servers Manager" page
    When user selects "2187808 Deribit|BTC-PERPETUAL" in the "Instrument filter" on the "Robot Positions" tab
    Then user sees warning icon in the "Instrument filter" on the "Robot Positions" tab


  @clearIndexedDb
  Scenario: Checking that there is a notice "No Rows To Show" with the "Virtual Accounts filter" in the "Robot Positions" tab
    Given user goes on the "Trading Servers Manager" page with selected "Robot Positions" tab of the "test_rpc_robot" "Robot"
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user sees the "Robot Positions" tab in the "Trading Servers Manager" page
    When user sets "221 hero.bns" in the "Virtual Accounts filter" on the "Robot Positions" tab
    Then user sees "No Rows To Show" in the table


  @clearIndexedDb
  Scenario: Checking the sets of the "Virtual Accounts filter" in the "Robot Positions" tab
    Given user goes on the "Trading Servers Manager" page with selected "Robot Positions" tab of the "test_rpc_robot" "Robot"
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user sees the "Robot Positions" tab in the "Trading Servers Manager" page
    And user sets "421 deribit.test" in the "Virtual Accounts filter" on the "Robot Positions" tab
    When user sees "421" in the "VA ID" columns in the table
    Then user sees "deribit.test" in the "VA" columns in the table


  @clearIndexedDb
  Scenario: Checking the resets of the "Virtual Accounts filter" in the "Robot Positions" tab
    Given user goes on the "Trading Servers Manager" page with selected "Robot Positions" tab of the "test_rpc_robot" "Robot"
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user sees the "Robot Positions" tab in the "Trading Servers Manager" page
    When user sets "221 hero.bns" in the "Virtual Accounts filter" on the "Robot Positions" tab
    Then user sees "No Rows To Show" in the table
    When user resets the "Virtual Accounts filter" on the "Robot Positions" tab
    Then user not sees a selects "Virtual Accounts" in the "Virtual Accounts filter" on the "Robot Positions" tab
    And user not sees "No Rows To Show" in the table


  @clearIndexedDb
  Scenario: Checking the visible warning after selects the "Virtual Accounts filter" in the "Robot Positions" tab
    Given user goes on the "Trading Servers Manager" page with selected "Robot Positions" tab of the "test_rpc_robot" "Robot"
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user sees the "Robot Positions" tab in the "Trading Servers Manager" page
    When user selects "421 deribit.test" in the "Virtual Accounts filter" on the "Robot Positions" tab
    Then user sees warning icon in the "Virtual Accounts filter" on the "Robot Positions" tab


  @clearIndexedDb
  Scenario: Checking the functionality of the override "Instrument" filter in the "Robot Positions" tab
    Given user goes on the "Trading Servers Manager" page with selected "Robot Positions" tab of the "test_rpc_robot" "Robot"
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user sees the "Robot Positions" tab in the "Trading Servers Manager" page
    And user types "BTC-PERPETUAL|Deribit" in the override "Instrument" filter in the "Robot Positions" tab
    When user sees "BTC-PERPETUAL|Deribit" in the "Instrument" columns in the table
    And user types "ETHBTC|BinanceSpot" in the override "Instrument" filter in the "Robot Positions" tab
    Then user sees "No Rows To Show" in the table


  @clearIndexedDb
  Scenario: Checking the functionality of the override "VA"" filter in the "Robot Positions" tab
    Given user goes on the "Trading Servers Manager" page with selected "Robot Positions" tab of the "test_rpc_robot" "Robot"
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user sees the "Robot Positions" tab in the "Trading Servers Manager" page
    And user types "deribit.test" in the override "VA" filter in the "Robot Positions" tab
    When user sees "deribit.test" in the "VA" columns in the table
    And user types "hero.bn" in the override "VA" filter in the "Robot Positions" tab
    Then user sees "No Rows To Show" in the table


  @clearIndexedDb
  Scenario Outline: Checking the row download by "<NameButton>" button in the "Robot Positions" tab
    Given user goes on the "Trading Servers Manager" page with selected "Robot Positions" tab of the "test_rpc_robot" "Robot"
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user sees the "Robot Positions" tab in the "Trading Servers Manager" page
    And user clicks on the "<NameButton>" button
    When user sees the "<SuccessMessage>" success message
    Then user checks the downloaded file with file "<NameFile>"

    Examples:
      | NameButton | SuccessMessage                           | NameFile                              |
      | CSV        | 2 table rows copied to clipboard as CSV  | robot-positions/robot-positions.csv   |
      | TSV        | 2 table rows copied to clipboard as TSV  | robot-positions/robot-positions.tsv   |
      | JSON       | 2 table rows copied to clipboard as JSON | robot-positions/robot-positions.json  |