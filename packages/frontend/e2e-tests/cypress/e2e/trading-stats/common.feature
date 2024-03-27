Feature: e2e tests: "Trading Stats" page test suit. I as User check the data in the tables

  Background:
    Given user selects the "autotest" server

  @clearIndexedDb
  Scenario: Checking the selection of "Daily" and "Monthly" pages
    Given user goes to the "Trading Stats" page with the backend server parameter
    And user sees the "Daily" page of the "Trading Stats"
    And user clicks the "Monthly" button
    And user sees the "Monthly" page of the "Trading Stats"
    When user clicks the "Daily" button
    Then user sees the "Daily" page of the "Trading Stats"


  @clearIndexedDb
  Scenario: Checking functionality the "Daily" calendar
    Given user goes on the "Daily" page in the "Trading Stats"
    And user sees the "Daily" page of the "Trading Stats"
    When user types "2023-08-01" date in the "Daily" calendar
    Then user sees "2023-08-01" date in the URL page


  @clearIndexedDb
  Scenario: Checking functionality the "Monthly" calendar
    Given user goes on the "Monthly" page in the "Trading Stats"
    And user sees the "Monthly" page of the "Trading Stats"
    When user types "2023-08-01" and "2023-08-31" date in the "Monthly" calendar
    And user sees "2023-08-01" date in the URL page
    Then user sees "2023-08-31" date in the URL page


  @clearIndexedDb
  Scenario: Checking functionality the "Daily" calendar
    Given user goes on the "Daily" page in the "Trading Stats"
    And user sees the "Daily" page of the "Trading Stats"
    And user sees the "Daily" calendar
    When user sees "Today`s" date in the "Daily" calendar
    And user clicks "Previous" daily button
    And user sees "Previous" date in the "Daily" calendar
    And user clicks "Next" daily button
    Then user sees "Next" date in the "Daily" calendar


  @clearIndexedDb
  Scenario: Checking functionality the "Monthly" calendar
    Given user goes on the "Monthly" page in the "Trading Stats"
    And user sees the "Monthly" page of the "Trading Stats"
    And user sees the "Monthly" calendar
    When user sees "Today`s" date in the "Monthly" calendar
    And user clicks "Previous" monthly button
    And user sees "Previous" date in the "Monthly" calendar
    And user clicks "Next" monthly button
    Then user sees "Next" date in the "Monthly" calendar


  @clearIndexedDb
  Scenario Outline: Checking data in the "<NameTable>" table on the "Daily" page
    Given user goes on the "2023-06-05" date the "Daily" page
    And user sees the "Daily" page of the "Trading Stats"
    And user sets "18416" in the "Backtesting ID" filter
    And user opens the "<NameTable>" table
    When user sees value in the "<NameTable>" table
    And user reload a page
    Then user sees value in the "<NameTable>" table

    Examples:
      | NameTable |
#      | PNL       |
#      | ARB       | waiting for a fix from the backend
      | Trades    |


  @clearIndexedDb
  Scenario Outline: Checking data in the "<NameTable>" table on the "Monthly" page
    Given user goes on the "2023-06-05 - 2023-06-30" date the "Monthly" page
    And user sees the "Monthly" page of the "Trading Stats"
    And user sets "18416" in the "Backtesting ID" filter
    And user opens the "<NameTable>" table
    When user sees value in the "<NameTable>" table
    And user reload a page
    Then user sees value in the "<NameTable>" table

    Examples:
      | NameTable  |
      | Profits    |
      | ARB Volume |
      | ARB Maker  |
      | ARB Taker  |
      | ARB Fees   |


  @clearIndexedDb
  Scenario: Checking data in the "Profits" table after changing the calendar on the "Monthly" page
    Given user goes on the "Monthly" page in the "Trading Stats"
    And user sees the "Monthly" page of the "Trading Stats"
    And user opens the "Profits" table
    And user sets "18416" in the "Backtesting ID" filter
    And user types "2023-09-01" and "2023-09-30" date in the "Monthly" calendar
    When user sees data for "September" in the "Profits" table
    And user clicks "Next" monthly button
    When user sees data for "October" in the "Profits" table
    And user clicks "Next" monthly button
    When user sees data for "November" in the "Profits" table
    And user clicks "Previous" monthly button
    When user sees data for "October" in the "Profits" table
    And user clicks "Previous" monthly button
    Then user sees data for "September" in the "Profits" table


  @clearIndexedDb
  Scenario Outline: Checking sees "No Rows To Show" in the table of the "Daily" page
    Given user goes on the "2021-01-01" date the "Daily" page
    When user sees the "Daily" page of the "Trading Stats"
    And user waits for "5" seconds
    And user opens the "<NameTable>" table
    Then user sees "No Rows To Show" in the table

    Examples:
      | NameTable |
      | PNL       |
      | ARB       |
      | Trades    |


  @clearIndexedDb
  Scenario Outline: Checking the first row download by "<NameButton>" button in the "Trades" table of the "Daily" page
    Given user goes on the "2023-06-05" date the "Daily" page
    And user sees the "Daily" page of the "Trading Stats"
    And user sets "18416" in the "Backtesting ID" filter
    And user opens the "Trades" table
    And user selects the first row in the "Trades" table
    And user clicks on the "<NameButton>" button
    Then user sees the "<SuccessMessage>" success message
    And user checks the downloaded file with file "<NameFile>"

    Examples:
      | NameButton | SuccessMessage                           | NameFile                      |
      | CSV        | 1 table rows copied to clipboard as CSV  | trading-stats/trades-row.csv  |
      | TSV        | 1 table rows copied to clipboard as TSV  | trading-stats/trades-row.tsv  |
      | JSON       | 1 table rows copied to clipboard as JSON | trading-stats/trades-row.json |


  @clearIndexedDb
  Scenario Outline: Checking the all rows download by "<NameButton>" button in the "Trades" table of the "Daily" page
    Given user goes on the "2023-06-05" date the "Daily" page
    And user sees the "Daily" page of the "Trading Stats"
    And user sets "18477" in the "Backtesting ID" filter
    And user opens the "Trades" table
    And user sets date "2023-06-05 01:03:00" and "2023-06-05 01:03:08" in the "Trades" table filters
    And user clicks on the "<NameButton>" button
    Then user sees the "<SuccessMessage>" success message
    And user checks the downloaded file with file "<NameFile>"

    Examples:
      | NameButton | SuccessMessage                            | NameFile                        |
      | CSV        | 20 table rows copied to clipboard as CSV  | trading-stats/trades-rows.csv   |
      | TSV        | 20 table rows copied to clipboard as TSV  | trading-stats/trades-rows.tsv   |
      | JSON       | 20 table rows copied to clipboard as JSON | trading-stats/trades-rows.json  |

