Feature: e2e tests: "TSM" page test suit. I as a User check open the dashboard tab of "Indicators" tab

  Background:
    Given user selects the "default" server

  @clearIndexedDb
  Scenario: Checking the opening of the indicator dashboard
    Given user goes on the "Trading Servers Manager" page with the selected "Indicators" tab
    And user types "Hero.t_17.target_amount" in the input field
    And user sees "Hero.t_17.target_amount" names in the table
    And user clicks the "Hero.t_17.target_amount" name in the table
    Then user sees the new "Hero.t_17.target_amount" tab


  @clearIndexedDb
  Scenario: Checking the opening of the dashboard of two indicators
    Given user goes on the "Trading Servers Manager" page with the selected "Indicators" tab
    And user clicks header table "Name" button
    And user types "Hero.t_541" in the input field
    And user sees "Hero.t_541" names in the table
    And user selects a "Two Rows" that contains the name "robot.trading_tasks"
    When user clicks on the "Dashboard" button
    Then user sees the new "2 indicators" tab


  @clearIndexedDb
  Scenario: Checking the opening of the dashboard of six indicators
    Given user goes on the "Trading Servers Manager" page with the selected "Indicators" tab
    And user clicks header table "Name" button
    And user types "Hero.t_541" in the input field
    And user sees "Hero.t_541" names in the table
    And user selects a "All Rows" that contains the name "robot.trading_tasks"
    When user clicks on the "Dashboard" button
    Then user sees the new "6 indicators" tab