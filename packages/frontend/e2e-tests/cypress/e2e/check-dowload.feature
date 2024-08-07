Feature: e2e tests: "Trading Stats" page test suit. I as User check functionality download buttons

  Background:
    Given user selects the "autotest" server

  @clearIndexedDb
  Scenario Outline: Checking the first row download by "<NameButton>" button in the "Trades" table of the "Daily" page
    Given user goes on the "2023-06-06" date by "25504" "Backtesting ID" the "Daily" page with open the "Trades" tab
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user sees the "Trades" table in the "Trading Stats"
    When user selects the first row in the "Trades" table
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
    Given user goes on the "2023-06-06" date by "25504" "Backtesting ID" the "Daily" page with open the "Trades" tab
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user sees the "Trades" table in the "Trading Stats"
    When user sets date "2023-06-06 00:00:05" and "2023-06-06 00:00:25" in the "Trades" table filters
    And user sees data in the "Trades" table
    And user clicks on the "<NameButton>" button
    Then user sees the "<SuccessMessage>" success message
    And user checks the downloaded file with file "<NameFile>"

    Examples:
      | NameButton | SuccessMessage                            | NameFile                        |
      | CSV        | 23 table rows copied to clipboard as CSV  | trading-stats/trades-rows.csv   |
      | TSV        | 23 table rows copied to clipboard as TSV  | trading-stats/trades-rows.tsv   |
      | JSON       | 23 table rows copied to clipboard as JSON | trading-stats/trades-rows.json  |

