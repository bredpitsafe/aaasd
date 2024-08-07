Feature: e2e tests: "Trading Stats" page test suit. I as User check data in the table

  Background:
    Given user selects the "autotest" server

  @clearIndexedDb
  Scenario: Checking the selection of "Daily" and "Monthly" pages
    Given user goes to the "Trading Stats" page with the backend server parameter
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user sees the "Daily" page of the "Trading Stats"
    And user clicks the "Monthly" button
    And user sees the "Monthly" page of the "Trading Stats"
    When user clicks the "Daily" button
    Then user sees the "Daily" page of the "Trading Stats"


#  @clearIndexedDb
#  Scenario Outline: Checking data in the "<NameTable>" table on the "Daily" page
#    Given user goes on the "2023-06-06" date by "25504" "Backtesting ID" the "Daily" page with open the "<NameTable>" tab
#    And user sees the "Authorization" page and logs in as a "Frontend" user
#    And user sees the "<NameTable>" table in the "Trading Stats"
#    When user sees value in the "<NameTable>" table
#    And user reload a page
#    Then user sees value in the "<NameTable>" table
#
#    Examples:
#      | NameTable |
#      | PNL       |
#      | ARB       |
#      | Trades    |
#
#
#  @clearIndexedDb
#  Scenario Outline: Checking data in the "<NameTable>" table on the "Monthly" page
#    Given user goes on the "2023-06-06 - 2023-06-06" date by "25504" "Backtesting ID" the "Monthly" page with open the "<NameTable>" tab
#    And user sees the "Authorization" page and logs in as a "Frontend" user
#    And user sees the "<NameTable>" table in the "Trading Stats"
#    When user sees value in the "<NameTable>" table
#    And user reload a page
#    Then user sees value in the "<NameTable>" table
#
#    Examples:
#      | NameTable  |
#      | Profits    |
#      | ARB Volume |
#      | ARB Maker  |
#      | ARB Taker  |
#      | ARB Fees   |
#
#
#  @clearIndexedDb
#  Scenario Outline: Checking sees "No Rows To Show" in the "<NameTable>" table of the "Daily" page
#    Given user goes on the "2021-01-01" date the "Daily" page with open the "<NameTable>" tab
#    And user sees the "Authorization" page and logs in as a "Frontend" user
#    When user sees the "<NameTable>" table in the "Trading Stats"
#    And user waits for "5" seconds
#    Then user sees "No Rows To Show" in the table
#
#    Examples:
#      | NameTable |
#      | PNL       |
#      | ARB       |
#      | Trades    |
#
#
#  @clearIndexedDb
#  Scenario: Checking sees "No Rows To Show" in the "Trades" table after sets data in the "Trades" table filters
#    Given user goes on the "2023-06-06" date by "25504" "Backtesting ID" the "Daily" page with open the "Trades" tab
#    And user sees the "Authorization" page and logs in as a "Frontend" user
#    And user sees the "Trades" table in the "Trading Stats"
#    When user sets date "2023-06-06 00:00:05" and "2023-06-06 00:00:25" in the "Trades" table filters
#    And user is waiting for the data to load in the table
#    When user sees data in the "Trades" table
#    And user sets date "2023-06-06 00:00:02" and "2023-06-06 00:00:03" in the "Trades" table filters
##    Then user sees "No Rows To Show" in the table https://bhft-company.atlassian.net/browse/FRT-1849
#
#
#  @clearIndexedDb
#  Scenario: Checking colors in the "Profits" table on the "Monthly" page
#    Given user goes on the "2023-06-06 - 2023-06-06" date by "25504" "Backtesting ID" the "Monthly" page with open the "Profits" tab
#    And user sees the "Authorization" page and logs in as a "Frontend" user
#    And user sees the "Profits" table in the "Trading Stats"
#    When user sees value in the "Profits" table
#    Then  user sees the values from red and green colors in the "Profits" table

