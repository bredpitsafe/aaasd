Feature: e2e tests: "TSM" page test suit. I as User checks the functionality of "Robot Balances" tap

  Background:
    Given user selects the "default" server

  @clearIndexedDb
  Scenario: Checking the selection of the "Robot Balances" tab
    Given user goes to the "Trading Servers Manager" page with the backend server parameter
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user selects "HerodotusMulti" component from "Robots" table
    When user selects the "Robot Balances" tab on the "Trading Servers Manager" page
    Then user sees the "Robot Balances" tab in the "Trading Servers Manager" page


  @clearIndexedDb
  Scenario: Checking that there is a notice "No Rows To Show" with the "Instrument filter" in the "Robot Balances" tab
    Given user goes on the "Trading Servers Manager" page with selected "Robot Balances" tab of the "HerodotusMulti" "Robot"
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user sees the "Robot Balances" tab in the "Trading Servers Manager" page
    When user sets "108 BinanceSwap|BTCUSDT" in the "Instrument filter" on the "Robot Balances" tab
    Then user sees "No Rows To Show" in the table


  @clearIndexedDb
  Scenario: Checking the sets of the "Instrument filter" in the "Robot Balances" tab
    Given user goes on the "Trading Servers Manager" page with selected "Robot Balances" tab of the "HerodotusMulti" "Robot"
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user sees the "Robot Balances" tab in the "Trading Servers Manager" page
    And user sets "129908 BinanceSpot|BTCUSDT" in the "Instrument filter" on the "Robot Balances" tab
    When user sees "129908" in the "Instrument ID" columns in the table
    Then user sees "BTCUSDT|BinanceSpot" in the "Instrument" columns in the table


  @clearIndexedDb
  Scenario: Checking the resets of the "Instrument filter" in the "Robot Balances" tab
    Given user goes on the "Trading Servers Manager" page with selected "Robot Balances" tab of the "HerodotusMulti" "Robot"
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user sees the "Robot Balances" tab in the "Trading Servers Manager" page
    And user sets "108 BinanceSwap|BTCUSDT" in the "Instrument filter" on the "Robot Balances" tab
    And user sees "No Rows To Show" in the table
    When user resets the "Instrument filter" on the "Robot Balances" tab
    Then user not sees a selects "Instrument" in the "Instrument filter" on the "Robot Balances" tab
    And user not sees "No Rows To Show" in the table


  @clearIndexedDb
  Scenario: Checking the visible warning after selects the "Instrument filter" in the "Robot Balances" tab
    Given user goes on the "Trading Servers Manager" page with selected "Robot Balances" tab of the "HerodotusMulti" "Robot"
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user sees the "Robot Balances" tab in the "Trading Servers Manager" page
    When user selects "129908 BinanceSpot|BTCUSDT" in the "Instrument filter" on the "Robot Balances" tab
    Then user sees warning icon in the "Instrument filter" on the "Robot Balances" tab


  @clearIndexedDb
  Scenario: Checking that there is a notice "No Rows To Show" with the "Virtual Accounts filter" in the "Robot Balances" tab
    Given user goes on the "Trading Servers Manager" page with selected "Robot Balances" tab of the "HerodotusMulti" "Robot"
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user sees the "Robot Balances" tab in the "Trading Servers Manager" page
    When user sets "221 hero.bns" in the "Virtual Accounts filter" on the "Robot Balances" tab
    Then user sees "No Rows To Show" in the table


  @clearIndexedDb
  Scenario: Checking the sets of the "Virtual Accounts filter" in the "Robot Balances" tab
    Given user goes on the "Trading Servers Manager" page with selected "Robot Balances" tab of the "HerodotusMulti" "Robot"
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user sees the "Robot Balances" tab in the "Trading Servers Manager" page
    And user sets "121 hero.bn" in the "Virtual Accounts filter" on the "Robot Balances" tab
    When user sees "121" in the "VA ID" columns in the table
    Then user sees "hero.bn" in the "VA" columns in the table


  @clearIndexedDb
  Scenario: Checking the resets of the "Virtual Accounts filter" in the "Robot Balances" tab
    Given user goes on the "Trading Servers Manager" page with selected "Robot Balances" tab of the "HerodotusMulti" "Robot"
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user sees the "Robot Balances" tab in the "Trading Servers Manager" page
    When user sets "221 hero.bns" in the "Virtual Accounts filter" on the "Robot Balances" tab
    And user sees "No Rows To Show" in the table
    When user resets the "Virtual Accounts filter" on the "Robot Balances" tab
    Then user not sees a selects "Virtual Accounts" in the "Virtual Accounts filter" on the "Robot Balances" tab
    And user not sees "No Rows To Show" in the table


  @clearIndexedDb
  Scenario: Checking the visible warning after selects the "Virtual Accounts filter" in the "Robot Balances" tab
    Given user goes on the "Trading Servers Manager" page with selected "Robot Balances" tab of the "HerodotusMulti" "Robot"
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user sees the "Robot Balances" tab in the "Trading Servers Manager" page
    When user selects "121 hero.bn" in the "Virtual Accounts filter" on the "Robot Balances" tab
    Then user sees warning icon in the "Virtual Accounts filter" on the "Robot Balances" tab


  @clearIndexedDb
  Scenario: Checking that there is a notice "No Rows To Show" with the "Assets filter" in the "Robot Balances" tab
    Given user goes on the "Trading Servers Manager" page with selected "Robot Balances" tab of the "HerodotusMulti" "Robot"
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user sees the "Robot Balances" tab in the "Trading Servers Manager" page
    When user sets "332 ETH" in the "Assets filter" on the "Robot Balances" tab
    Then user sees "No Rows To Show" in the table


  @clearIndexedDb
  Scenario: Checking the sets of the "Assets filter" in the "Robot Balances" tab
    Given user goes on the "Trading Servers Manager" page with selected "Robot Balances" tab of the "HerodotusMulti" "Robot"
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user sees the "Robot Balances" tab in the "Trading Servers Manager" page
    And user sets "132 BTC" in the "Assets filter" on the "Robot Balances" tab
    When user sees first value "132" in the "Assets ID" columns
    Then user sees first value "BTC" in the "Assets" columns


  @clearIndexedDb
  Scenario: Checking the resets of the "Assets filter" in the "Robot Balances" tab
    Given user goes on the "Trading Servers Manager" page with selected "Robot Balances" tab of the "HerodotusMulti" "Robot"
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user sees the "Robot Balances" tab in the "Trading Servers Manager" page
    When user sets "332 ETH" in the "Assets filter" on the "Robot Balances" tab
    And user sees "No Rows To Show" in the table
    When user resets the "Assets filter" on the "Robot Balances" tab
    Then user not sees a selects "Accounts" in the "Assets filter" on the "Robot Balances" tab
    And user not sees "No Rows To Show" in the table


  @clearIndexedDb
  Scenario: Checking the visible warning after selects the "Assets filter" in the "Robot Balances" tab
    Given user goes on the "Trading Servers Manager" page with selected "Robot Balances" tab of the "HerodotusMulti" "Robot"
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user sees the "Robot Balances" tab in the "Trading Servers Manager" page
    When user selects "132 BTC" in the "Assets filter" on the "Robot Balances" tab
    Then user sees warning icon in the "Virtual Accounts filter" on the "Robot Balances" tab


  @clearIndexedDb
  Scenario: Checking the functionality of the override "Instrument" filter in the "Robot Balances" tab
    Given user goes on the "Trading Servers Manager" page with selected "Robot Balances" tab of the "HerodotusMulti" "Robot"
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user sees the "Robot Balances" tab in the "Trading Servers Manager" page
    And user types "BTCUSDT|BinanceSpot" in the override "Instrument" filter in the "Robot Balances" tab
    When user sees "BTCUSDT|BinanceSpot" in the "Instrument" columns in the table
    And user types "ETHBTC|BinanceSpot" in the override "Instrument" filter in the "Robot Balances" tab
    Then user sees "No Rows To Show" in the table


  @clearIndexedDb
  Scenario: Checking the functionality of the override "VA"" filter in the "Robot Balances" tab
    Given user goes on the "Trading Servers Manager" page with selected "Robot Balances" tab of the "HerodotusMulti" "Robot"
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user sees the "Robot Balances" tab in the "Trading Servers Manager" page
    And user types "hero.bn" in the override "VA" filter in the "Robot Balances" tab
    When user sees "hero.bn" in the "VA" columns in the table
    And user types "hero.bns" in the override "VA" filter in the "Robot Balances" tab
    Then user sees "No Rows To Show" in the table


  @clearIndexedDb
  Scenario: Checking the functionality of the override "Asset"" filter in the "Robot Balances" tab
    Given user goes on the "Trading Servers Manager" page with selected "Robot Balances" tab of the "HerodotusMulti" "Robot"
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user sees the "Robot Balances" tab in the "Trading Servers Manager" page
    And user types "BNB" in the override "Asset" filter in the "Robot Balances" tab
    When user sees "BNB" in the "Asset" columns in the table
    And user types "ETH" in the override "Asset" filter in the "Robot Balances" tab
    Then user sees "No Rows To Show" in the table


  @clearIndexedDb
  Scenario Outline: Checking the row download by "<NameButton>" button in the "Robot Balances" tab
    Given user goes on the "Trading Servers Manager" page with selected "Robot Balances" tab of the "HerodotusMulti" "Robot"
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user sees the "Robot Balances" tab in the "Trading Servers Manager" page
    And user clicks on the "<NameButton>" button
    When user sees the "<SuccessMessage>" success message
    Then user checks the downloaded file with file "<NameFile>"

    Examples:
      | NameButton | SuccessMessage                           | NameFile                            |
      | CSV        | 3 table rows copied to clipboard as CSV  | robot-balances/robot-balances.csv   |
      | TSV        | 3 table rows copied to clipboard as TSV  | robot-balances/robot-balances.tsv   |
      | JSON       | 3 table rows copied to clipboard as JSON | robot-balances/robot-balances.json  |