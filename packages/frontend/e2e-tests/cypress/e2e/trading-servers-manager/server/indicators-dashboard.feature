Feature: e2e tests: "TSM" page test suit. I as a User check open the dashboard tab of "Indicators" tab

  Background:
    Given user selects the "default" server

  @clearIndexedDb
  Scenario: Checking the opening of the indicator dashboard
    Given user goes on the "Trading Servers Manager" page with the selected "Indicators" tab
    And user sees the "Authorization" page and logs in as a "Frontend" user
    When user types "Hero1.T0001.sold_base" in the input field
    And user is waiting for the data to load in the table
    And user sees the "Hero1.T0001.sold_base" in "Name" column of table
    And user opens the context menu and selects "Reset Columns" in the table
    When user clicks the "Hero1.T0001.sold_base" name in the table
    Then user sees the new "Hero1.T0001.sold_base" tab


  @clearIndexedDb
  Scenario: Checking the opening of the dashboard of two indicators
    Given user goes on the "Trading Servers Manager" page with the selected "Indicators" tab
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user clicks header table "Name" button
    When user types "Hero.t_541" in the input field
    And user is waiting for the data to load in the table
    And user sees the "Hero.t_541" in "Name" column of table
    And user selects a "Two Rows" that contains the name "robot.trading_tasks"
    When user clicks on the "Dashboard" button
    Then user sees the new "2 indicators" tab


  @clearIndexedDb
  Scenario: Checking the opening of the dashboard of six indicators
    Given user goes on the "Trading Servers Manager" page with the selected "Indicators" tab
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user clicks header table "Name" button
    When user types "Hero.t_541" in the input field
    And user is waiting for the data to load in the table
    And user sees the "Hero.t_541" in "Name" column of table
    And user selects a "All Rows" that contains the name "robot.trading_tasks"
    When user clicks on the "Dashboard" button
    Then user sees the new "6 indicators" tab