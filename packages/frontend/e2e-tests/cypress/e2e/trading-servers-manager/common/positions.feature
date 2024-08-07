Feature: e2e tests: "TSM" page test suit. I as User checks the functionality of "Positions" tap

  Background:
    Given user selects the "default" server

  @clearIndexedDb
  Scenario: Checking the selection of the "Positions" tab
    Given user goes to the "Trading Servers Manager" page with the backend server parameter
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user sees the name "Servers" in the header
    When user selects the "Positions" tab on the "Trading Servers Manager" page
    Then user sees the "Positions" tab in the "Trading Servers Manager" page


  @clearIndexedDb
  Scenario: Checking the functionality of the "Non-zero balances only" switch of the "Positions" tab
    Given user goes on the "Trading Servers Manager" page with the selected "Positions" tab
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user not sees a row of values "HerodotusMulti.HerodotusMulti" in the table
    When user clicks on the "Non-zero balances only" switch on the "Positions" tab
    Then user sees a row of values "HerodotusMulti.HerodotusMulti" in the table


  @clearIndexedDb
  Scenario: Checking that there is a notice "No Rows To Show" with the "Instrument filter" in the "Positions" tab
    Given user goes on the "Trading Servers Manager" page with the selected "Positions" tab
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user sees the "Positions" tab in the "Trading Servers Manager" page
    When user sets "108 BinanceSwap|BTCUSDT" in the "Instrument filter" on the "Positions" tab
    Then user sees "No Rows To Show" in the table


  @clearIndexedDb
  Scenario: Checking the sets of the "Instrument filter" in the "Positions" tab
    Given user goes on the "Trading Servers Manager" page with the selected "Positions" tab
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user sees the "Positions" tab in the "Trading Servers Manager" page
    And user sets "2187808 Deribit|BTC-PERPETUAL" in the "Instrument filter" on the "Positions" tab
    When user sees "2187808" in the "Instrument ID" columns in the table
    Then user sees "BTC-PERPETUAL|Deribit" in the "Instrument" columns in the table


  @clearIndexedDb
  Scenario: Checking the resets of the "Instrument filter" in the "Positions" tab
    Given user goes on the "Trading Servers Manager" page with the selected "Positions" tab
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user sees the "Positions" tab in the "Trading Servers Manager" page
    And user sets "108 BinanceSwap|BTCUSDT" in the "Instrument filter" on the "Positions" tab
    Then user sees "No Rows To Show" in the table
    When user resets the "Instrument filter" on the "Positions" tab
    Then user not sees a selects "Instrument" in the "Instrument filter" on the "Positions" tab
    And user not sees "No Rows To Show" in the table


  @clearIndexedDb
  Scenario: Checking the visible warning after selects the "Instrument filter" in the "Positions" tab
    Given user goes on the "Trading Servers Manager" page with the selected "Positions" tab
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user sees the "Positions" tab in the "Trading Servers Manager" page
    And user selects "2187808 Deribit|BTC-PERPETUAL" in the "Instrument filter" on the "Positions" tab
    Then user sees warning icon in the "Instrument filter" on the "Positions" tab


  @clearIndexedDb
  Scenario: Checking that there is a notice "No Rows To Show" with the "Virtual Accounts filter" in the "Positions" tab
    Given user goes on the "Trading Servers Manager" page with the selected "Positions" tab
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user sees the "Positions" tab in the "Trading Servers Manager" page
    When user sets "221 hero.bns" in the "Virtual Accounts filter" on the "Positions" tab
    Then user sees "No Rows To Show" in the table


  @clearIndexedDb
  Scenario: Checking the sets of the "Virtual Accounts filter" in the "Positions" tab
    Given user goes on the "Trading Servers Manager" page with the selected "Positions" tab
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user sees the "Positions" tab in the "Trading Servers Manager" page
    And user sets "421 deribit.test" in the "Virtual Accounts filter" on the "Positions" tab
    When user sees "421" in the "VA ID" columns in the table
    Then user sees "deribit.test" in the "VA" columns in the table


  @clearIndexedDb
  Scenario: Checking the resets of the "Virtual Accounts filter" in the "Positions" tab
    Given user goes on the "Trading Servers Manager" page with the selected "Positions" tab
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user sees the "Positions" tab in the "Trading Servers Manager" page
    And user sets "221 hero.bns" in the "Virtual Accounts filter" on the "Positions" tab
    Then user sees "No Rows To Show" in the table
    When user resets the "Virtual Accounts filter" on the "Positions" tab
    Then user not sees a selects "Virtual Accounts" in the "Virtual Accounts filter" on the "Positions" tab
    And user not sees "No Rows To Show" in the table


  @clearIndexedDb
  Scenario: Checking the visible warning after selects the "Virtual Accounts filter" in the "Positions" tab
    Given user goes on the "Trading Servers Manager" page with the selected "Positions" tab
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user sees the "Positions" tab in the "Trading Servers Manager" page
    When user selects "421 deribit.test" in the "Virtual Accounts filter" on the "Positions" tab
    Then user sees warning icon in the "Virtual Accounts filter" on the "Positions" tab


  @clearIndexedDb
  Scenario: Checking that there is a notice "No Rows To Show" with the "Robots filter" in the "Positions" tab
    Given user goes on the "Trading Servers Manager" page with the selected "Positions" tab
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user sees the "Positions" tab in the "Trading Servers Manager" page
    When user sets "917 TestMdIndicator" in the "Robots filter" on the "Positions" tab
    Then user sees "No Rows To Show" in the table


  @clearIndexedDb
  Scenario: Checking the sets of the "Robots filter" in the "Positions" tab
    Given user goes on the "Trading Servers Manager" page with the selected "Positions" tab
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user sees the "Positions" tab in the "Trading Servers Manager" page
    And user sets "2417 test_rpc_robot" in the "Robots filter" on the "Positions" tab
    When user sees "2417" in the "Robot ID" columns in the table
    Then user sees "test_rpc_robot.test_rpc_robot" in the "Robot Name" columns in the table


  @clearIndexedDb
  Scenario: Checking the resets of the "Robots filter" in the "Positions" tab
    Given user goes on the "Trading Servers Manager" page with the selected "Positions" tab
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user sees the "Positions" tab in the "Trading Servers Manager" page
    When user sets "917 TestMdIndicator" in the "Robots filter" on the "Positions" tab
    And user sees "No Rows To Show" in the table
    When user resets the "Robots filter" on the "Positions" tab
    Then user not sees a selects "Robots" in the "Robots filter" on the "Positions" tab
    And user not sees "No Rows To Show" in the table


  @clearIndexedDb
  Scenario: Checking the visible warning after selects the "Robots filter" in the "Positions" tab
    Given user goes on the "Trading Servers Manager" page with the selected "Positions" tab
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user sees the "Positions" tab in the "Trading Servers Manager" page
    When user selects "2417 test_rpc_robot" in the "Robots filter" on the "Positions" tab
    Then user sees warning icon in the "Virtual Accounts filter" on the "Positions" tab


  @clearIndexedDb
  Scenario: Checking the functionality of the override "Instrument" filter in the "Positions" tab
    Given user goes on the "Trading Servers Manager" page with the selected "Positions" tab
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user sees the "Positions" tab in the "Trading Servers Manager" page
    And user types "BTC-PERPETUAL|Deribit" in the override "Instrument" filter in the "Positions" tab
    When user sees "BTC-PERPETUAL|Deribit" in the "Instrument" columns in the table
    And user types "ETHBTC|BinanceSpot" in the override "Instrument" filter in the "Positions" tab
    Then user sees "No Rows To Show" in the table


  @clearIndexedDb
  Scenario: Checking the functionality of the override "VA"" filter in the "Positions" tab
    Given user goes on the "Trading Servers Manager" page with the selected "Positions" tab
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user sees the "Positions" tab in the "Trading Servers Manager" page
    And user types "deribit.test" in the override "VA" filter in the "Positions" tab
    When user sees "deribit.test" in the "VA" columns in the table
    And user types "hero.bn" in the override "VA" filter in the "Positions" tab
    Then user sees "No Rows To Show" in the table


  @clearIndexedDb
  Scenario: Checking the functionality of the override "Robot Name"" filter in the "Positions" tab
    Given user goes on the "Trading Servers Manager" page with the selected "Positions" tab
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user sees the "Positions" tab in the "Trading Servers Manager" page
    And user types "test_rpc_robot" in the override "Robot Name" filter in the "Positions" tab
    When user sees "test_rpc_robot.test_rpc_robot" in the "Robot Name" columns in the table
    And user types "HerodotusMulti" in the override "Robot Name" filter in the "Positions" tab
    Then user sees "No Rows To Show" in the table


  @clearIndexedDb
  Scenario Outline: Checking the row download by "<NameButton>" button in the "Positions" tab
    Given user goes on the "Trading Servers Manager" page with the selected "Positions" tab
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user sees the "Positions" tab in the "Trading Servers Manager" page
    And user clicks the "2417" robotID in the table
    And user clicks on the "<NameButton>" button
    When user sees the "<SuccessMessage>" success message
    Then user checks the downloaded file with file "<NameFile>"

    Examples:
      | NameButton | SuccessMessage                           | NameFile                  |
      | CSV        | 1 table rows copied to clipboard as CSV  | positions/positions.csv   |
      | TSV        | 1 table rows copied to clipboard as TSV  | positions/positions.tsv   |
      | JSON       | 1 table rows copied to clipboard as JSON | positions/positions.json  |

