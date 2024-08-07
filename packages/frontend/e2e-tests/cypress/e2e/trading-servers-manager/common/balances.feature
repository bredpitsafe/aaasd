Feature: e2e tests: "TSM" page test suit. I as User checks the functionality of "Balances" tap

  Background:
    Given user selects the "default" server

  @clearIndexedDb
  Scenario: Checking the selection of the "Balances" tab
    Given user goes to the "Trading Servers Manager" page with the backend server parameter
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user sees the name "Servers" in the header
    When user selects the "Balances" tab on the "Trading Servers Manager" page
    Then user sees the "Balances" tab in the "Trading Servers Manager" page


  @clearIndexedDb
  Scenario: Checking that there is a notice "No Rows To Show" with the "No Rows To Show" with the "Instrument filter" in the "Balances" tab
    Given user goes on the "Trading Servers Manager" page with the selected "Balances" tab
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user sees the "Balances" tab in the "Trading Servers Manager" page
    When user sets "108 BinanceSwap|BTCUSDT" in the "Instrument filter" on the "Balances" tab
    Then user sees "No Rows To Show" in the table


  @clearIndexedDb
  Scenario: Checking the sets of the "Instrument filter" in the "Balances" tab
    Given user goes on the "Trading Servers Manager" page with the selected "Balances" tab
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user sees the "Balances" tab in the "Trading Servers Manager" page
    And user sets "129908 BinanceSpot|BTCUSDT" in the "Instrument filter" on the "Balances" tab
    When user sees "129908" in the "Instrument ID" columns in the table
    Then user sees "BTCUSDT|BinanceSpot" in the "Instrument" columns in the table


  @clearIndexedDb
  Scenario: Checking the resets of the "Instrument filter" in the "Balances" tab
    Given user goes on the "Trading Servers Manager" page with the selected "Balances" tab
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user sees the "Balances" tab in the "Trading Servers Manager" page
    And user sets "108 BinanceSwap|BTCUSDT" in the "Instrument filter" on the "Balances" tab
    And user sees "No Rows To Show" in the table
    When user resets the "Instrument filter" on the "Balances" tab
    Then user not sees a selects "Instrument" in the "Instrument filter" on the "Balances" tab
    And user not sees "No Rows To Show" in the table


  @clearIndexedDb
  Scenario: Checking the visible warning after selects the "Instrument filter" in the "Balances" tab
    Given user goes on the "Trading Servers Manager" page with the selected "Balances" tab
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user sees the "Balances" tab in the "Trading Servers Manager" page
    When user selects "129908 BinanceSpot|BTCUSDT" in the "Instrument filter" on the "Balances" tab
    Then user sees warning icon in the "Instrument filter" on the "Balances" tab


  @clearIndexedDb
  Scenario: Checking that there is a notice "No Rows To Show" with the "Virtual Accounts filter" in the "Balances" tab
    Given user goes on the "Trading Servers Manager" page with the selected "Balances" tab
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user sees the "Balances" tab in the "Trading Servers Manager" page
    When user sets "221 hero.bns" in the "Virtual Accounts filter" on the "Balances" tab
    Then user sees "No Rows To Show" in the table


  @clearIndexedDb
  Scenario: Checking the sets of the "Virtual Accounts filter" in the "Balances" tab
    Given user goes to the "Trading Servers Manager" page by "qa" server params
    And user sees the "Authorization" page and logs in as a "Frontend" user
    Given user goes on the "Trading Servers Manager" page with the selected "Balances" tab
    And user sets "121 hero.bn" in the "Virtual Accounts filter" on the "Balances" tab
    When user sees "121" in the "VA ID" columns in the table
    Then user sees "hero.bn" in the "VA" columns in the table


  @clearIndexedDb
  Scenario: Checking the resets of the "Virtual Accounts filter" in the "Balances" tab
    Given user goes on the "Trading Servers Manager" page with the selected "Balances" tab
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user sees the "Balances" tab in the "Trading Servers Manager" page
    When user sets "221 hero.bns" in the "Virtual Accounts filter" on the "Balances" tab
    And user sees "No Rows To Show" in the table
    When user resets the "Virtual Accounts filter" on the "Balances" tab
    Then user not sees a selects "Virtual Accounts" in the "Virtual Accounts filter" on the "Balances" tab
    And user not sees "No Rows To Show" in the table


  @clearIndexedDb
  Scenario: Checking the visible warning after selects the "Virtual Accounts filter" in the "Balances" tab
    Given user goes to the "Trading Servers Manager" page by "qa" server params
    And user sees the "Authorization" page and logs in as a "Frontend" user
    Given user goes on the "Trading Servers Manager" page with the selected "Balances" tab
    When user selects "121 hero.bn" in the "Virtual Accounts filter" on the "Balances" tab
    Then user sees warning icon in the "Virtual Accounts filter" on the "Balances" tab


  @clearIndexedDb
  Scenario: Checking that there is a notice "No Rows To Show" with the "Robots filter" in the "Balances" tab
    Given user goes on the "Trading Servers Manager" page with the selected "Balances" tab
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user sees the "Balances" tab in the "Trading Servers Manager" page
    When user sets "917 TestMdIndicator" in the "Robots filter" on the "Balances" tab
    Then user sees "No Rows To Show" in the table


  @clearIndexedDb
  Scenario: Checking the sets of the "Robots filter" in the "Balances" tab
    Given user goes on the "Trading Servers Manager" page with the selected "Balances" tab
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user sets "1017 HerodotusMulti" in the "Robots filter" on the "Balances" tab
    When user sees "1017" in the "Robot ID" columns in the table
    Then user sees "HerodotusMulti.HerodotusMulti" in the "Robot Name" columns in the table


  @clearIndexedDb
  Scenario: Checking the resets of the "Robots filter" in the "Balances" tab
    Given user goes on the "Trading Servers Manager" page with the selected "Balances" tab
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user sees the "Balances" tab in the "Trading Servers Manager" page
    When user sets "917 TestMdIndicator" in the "Robots filter" on the "Balances" tab
    And user sees "No Rows To Show" in the table
    When user resets the "Robots filter" on the "Balances" tab
    Then user not sees a selects "Accounts" in the "Robots filter" on the "Balances" tab
    And user not sees "No Rows To Show" in the table


  @clearIndexedDb
  Scenario: Checking the visible warning after selects the "Robots filter" in the "Balances" tab
    Given user goes on the "Trading Servers Manager" page with the selected "Balances" tab
    And user sees the "Authorization" page and logs in as a "Frontend" user
    When user selects "1017 HerodotusMulti" in the "Robots filter" on the "Balances" tab
    Then user sees warning icon in the "Robots filter" on the "Balances" tab


  @clearIndexedDb
  Scenario: Checking that there is a notice "No Rows To Show" with the "Assets filter" in the "Balances" tab
    Given user goes on the "Trading Servers Manager" page with the selected "Balances" tab
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user sees the "Balances" tab in the "Trading Servers Manager" page
    When user sets "432 BCH" in the "Assets filter" on the "Balances" tab
    Then user sees "No Rows To Show" in the table


  @clearIndexedDb
  Scenario: Checking the sets of the "Assets filter" in the "Balances" tab
    Given user goes on the "Trading Servers Manager" page with the selected "Balances" tab
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user sees the "Balances" tab in the "Trading Servers Manager" page
    And user sets "132 BTC" in the "Assets filter" on the "Balances" tab
    When user sees first value "132" in the "Assets ID" columns
    Then user sees first value "BTC" in the "Assets" columns


  @clearIndexedDb
  Scenario: Checking the resets of the "Assets filter" in the "Balances" tab
    Given user goes on the "Trading Servers Manager" page with the selected "Balances" tab
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user sees the "Balances" tab in the "Trading Servers Manager" page
    When user sets "432 BCH" in the "Assets filter" on the "Balances" tab
    And user sees "No Rows To Show" in the table
    When user resets the "Assets filter" on the "Balances" tab
    Then user not sees a selects "Accounts" in the "Assets filter" on the "Balances" tab
    Then user not sees "No Rows To Show" in the table


  @clearIndexedDb
  Scenario: Checking the visible warning after selects the "Assets filter" in the "Balances" tab
    Given user goes on the "Trading Servers Manager" page with the selected "Balances" tab
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user sees the "Balances" tab in the "Trading Servers Manager" page
    When user selects "132 BTC" in the "Assets filter" on the "Balances" tab
    Then user sees warning icon in the "Virtual Accounts filter" on the "Balances" tab


  @clearIndexedDb
  Scenario: Checking the functionality of the override "Instrument" filter in the "Balances" tab
    Given user goes on the "Trading Servers Manager" page with the selected "Balances" tab
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user sees the "Balances" tab in the "Trading Servers Manager" page
    And user types "BTCUSDT|BinanceSpot" in the override "Instrument" filter in the "Balances" tab
    When user sees "BTCUSDT|BinanceSpot" in the "Instrument" columns in the table
    And user types "ETHBTC|BinanceSpot" in the override "Instrument" filter in the "Balances" tab
    Then user sees "No Rows To Show" in the table


  @clearIndexedDb
  Scenario: Checking the functionality of the override "VA"" filter in the "Balances" tab
    Given user goes on the "Trading Servers Manager" page with the selected "Balances" tab
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user sees the "Balances" tab in the "Trading Servers Manager" page
    And user types "hero.bn" in the override "VA" filter in the "Balances" tab
    When user sees "hero.bn" in the "VA" columns in the table
    And user types "hero.bns" in the override "VA" filter in the "Balances" tab
    Then user sees "No Rows To Show" in the table


  @clearIndexedDb
  Scenario: Checking the functionality of the override "Robot Name"" filter in the "Balances" tab
    Given user goes on the "Trading Servers Manager" page with the selected "Balances" tab
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user sees the "Balances" tab in the "Trading Servers Manager" page
    And user types "HerodotusMulti" in the override "Robot Name" filter in the "Balances" tab
    When user sees "HerodotusMulti.HerodotusMulti" in the "Robot Name" columns in the table
    And user types "test_rps_robot" in the override "Robot Name" filter in the "Balances" tab
    Then user sees "No Rows To Show" in the table


  @clearIndexedDb
  Scenario: Checking the functionality of the override "Asset"" filter in the "Balances" tab
    Given user goes on the "Trading Servers Manager" page with the selected "Balances" tab
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user sees the "Balances" tab in the "Trading Servers Manager" page
    And user types "BNB" in the override "Asset" filter in the "Balances" tab
    When user sees "BNB" in the "Asset" columns in the table
    And user types "ETH" in the override "Asset" filter in the "Balances" tab
    Then user sees "No Rows To Show" in the table


  @clearIndexedDb
  Scenario Outline: Checking the row download by "<NameButton>" button in the "Balances" tab
    Given user goes on the "Trading Servers Manager" page with the selected "Balances" tab
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user sees the "Balances" tab in the "Trading Servers Manager" page
    And user clicks the "BTC" asset in the table
    And user clicks on the "<NameButton>" button
    When user sees the "<SuccessMessage>" success message
    Then user checks the downloaded file with file "<NameFile>"

    Examples:
      | NameButton | SuccessMessage                           | NameFile                |
      | CSV        | 1 table rows copied to clipboard as CSV  | balances/balances.csv   |
      | TSV        | 1 table rows copied to clipboard as TSV  | balances/balances.tsv   |
      | JSON       | 1 table rows copied to clipboard as JSON | balances/balances.json  |