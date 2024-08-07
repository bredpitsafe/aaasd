Feature: e2e tests: "TSM" page test suit.  I as a User check the operation of the filters of "Indicators" tab
  Background:
    Given user selects the "default" server

  @clearIndexedDb
  Scenario: Checking the selection of the "Indicators" tab
    Given user goes to the "Trading Servers Manager" page with the backend server parameter
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user sees the name "Servers" in the header
    When user selects the "Indicators" tab on the "Trading Servers Manager" page
    Then user sees the "Indicators" tab in the "Trading Servers Manager" page


  @clearIndexedDb
  Scenario Outline: Checking the functionality of the filter by name "<Name>"
    Given user goes on the "Trading Servers Manager" page with the selected "Indicators" tab
    And user sees the "Authorization" page and logs in as a "Frontend" user
    When user types "<Name>" in the input field
    Then user sees the "<Name>" in "Name" column of table

    Examples:
      | Name                |
      | Hero.t_             |
      | BinanceSpot.volume. |
      | BTCUSDT             |


  @clearIndexedDb
  Scenario: Checking the functionality of the filter by name "BTCUSDT|BinanceSwap.l1.ask.usd"
    Given user goes on the "Trading Servers Manager" page with the selected "Indicators" tab
    And user sees the "Authorization" page and logs in as a "Frontend" user
    When user types "BTCUSDT\|BinanceSwap.l1.ask.usd" in the input field
    Then user sees the "BTCUSDT|BinanceSwap.l1.ask.usd" in "Name" column of table


  @clearIndexedDb
  Scenario: Checking that there is a notice "No Rows To Show"
    Given user goes on the "Trading Servers Manager" page with the selected "Indicators" tab
    And user sees the "Authorization" page and logs in as a "Frontend" user
    When user types "X?@/Y" in the input field
    Then user sees "No Rows To Show" in the table


  @clearIndexedDb
  Scenario Outline: Checking the functionality of "Case Sensitive" button
    Given user goes on the "Trading Servers Manager" page with the selected "Indicators" tab
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user clicks header table "Update Time" button
    When user types "<Name>" in the input field
    And user sees the "<NameSensitive>" in "Name" column of table
    And user clicks on the "Case Sensitive" switch button in the "Indicators" tab
    Then user sees the "<Name>" in "Name" column of table
    And user not sees the "<NameSensitive>" in "Name" column of table

    Examples:
      | Name | NameSensitive |
      | usd  | USD           |


  @clearIndexedDb
  Scenario Outline: Checking the functionality of "Time" button. Selection "<Time>" time
    Given user goes on the "Trading Servers Manager" page with the selected "Indicators" tab
    And user sees the "Authorization" page and logs in as a "Frontend" user
    When user clicks on the "<Time>" time button in the "Indicators" tab
    And user clicks header table "Update Time" button
    And user sees actual "<Time>" date
    And user clicks header table "Update Time" button
    And user sees actual "<Time>" date
    And user clicks header table "Update Time" button
    Then user sees actual "<Time>" date

    Examples:
      | Time  |
      | 1h    |
      | 6h    |
      | 12h   |
      | 1D    |
      | 1W    |
      | 1M    |


  @clearIndexedDb
  Scenario: Checking the functionality of the "Select data" input
    Given user goes on the "Trading Servers Manager" page with the selected "Indicators" tab
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user clicks on the table header "Update Time" twice
    And user types "BinanceCoinSwap" in the input field
    When user sets "Update Time" in the "Data" input
    And user sees a new "Update Time" in the table
    Then user sees the "Update Time" less the "Data" in the input field


  Scenario: Checking the functionality of the filter by name "Hero.t_541" and "Time" button
    Given user goes on the "Trading Servers Manager" page with the selected "Indicators" tab
    And user sees the "Authorization" page and logs in as a "Frontend" user
    When user types "Hero.t_541" in the input field
    And user sees the "Hero.t_541" in "Name" column of table
    And user clicks on the "1h" time button in the "Indicators" tab
    Then user sees "No Rows To Show" in the table

