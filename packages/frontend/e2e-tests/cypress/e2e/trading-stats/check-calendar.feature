Feature: e2e tests: "Trading Stats" page test suit. I as User check functionality calendar

  Background:
    Given user selects the "autotest" server

  @clearIndexedDb
  Scenario: Checking functionality the "Daily" calendar
    Given user goes on the "Daily" page in the "Trading Stats"
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user sees the "Daily" page of the "Trading Stats"
    When user types "2023-08-01" date in the "Daily" calendar
    Then user sees "2023-08-01" date in the URL page


  @clearIndexedDb
  Scenario: Checking functionality the "Monthly" calendar
    Given user goes on the "Monthly" page in the "Trading Stats"
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user sees the "Monthly" page of the "Trading Stats"
    When user types "2023-08-01" and "2023-08-31" date in the "Monthly" calendar
    And user sees "2023-08-01" date in the URL page
    Then user sees "2023-08-31" date in the URL page


  @clearIndexedDb
  Scenario: Checking functionality the "Daily" calendar
    Given user goes on the "Daily" page in the "Trading Stats"
    And user sees the "Authorization" page and logs in as a "Frontend" user
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
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user sees the "Monthly" page of the "Trading Stats"
    And user sees the "Monthly" calendar
    When user sees "Today`s" date in the "Monthly" calendar
    And user clicks "Previous" monthly button
    And user sees "Previous" date in the "Monthly" calendar
    And user clicks "Next" monthly button
    Then user sees "Next" date in the "Monthly" calendar


#  @clearIndexedDb
#  Scenario: Checking data in the "Profits" table after changing the calendar on the "Monthly" page
#    Given user goes on the "Monthly" page in the "Trading Stats"
#    And user sees the "Authorization" page and logs in as a "Frontend" user
#    And user sees the "Monthly" page of the "Trading Stats"
#    And user opens the "Profits" table
#    And user sets "25504" in the "Backtesting ID" filter
#    And user types "2023-09-01" and "2023-09-30" date in the "Monthly" calendar
#    When user sees data for "September" in the "Profits" table
#    And user clicks "Next" monthly button
#    When user sees data for "October" in the "Profits" table
#    And user clicks "Next" monthly button
#    When user sees data for "November" in the "Profits" table
#    And user clicks "Previous" monthly button
#    When user sees data for "October" in the "Profits" table
#    And user clicks "Previous" monthly button
#    Then user sees data for "September" in the "Profits" table

