Feature: e2e tests: "BM" page test suit. I as User check the creation of a task with a two runs

  Background:
    Given user selects the "autotest" server

  @clearIndexedDb
  Scenario: Check the creation of a task with two runs
    Given user goes to the "Backtesting Manager" page with the backend server parameter
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user sees "Tasks" tab on the "Backtesting" page
    And user deletes created tasks in the "Tasks" table
    And user selects a "TaskTwoRuns" task and opens "Add Task" via the context menu
    And user sees the "Clone" tab in the "Backtesting Manager" page
    And user clears and types a random value in the "NameTask_TwoRuns" task input
    And user clicks the "Create and Run" button in the "Add Task" tab
    When user sees the "Backtesting Task created successfully" success message
#    When user sees the "Running" status in the "Tasks" tab https://bhft-company.atlassian.net/browse/FRT-2523
#    And user sees the "Initializing" status of the "Runs" tab for "first" run
#    And user sees the "Succeed" status of the "Runs" tab for "first" run
#    And user sees the "Initializing" status of the "Runs" tab for "second" run
#    And user sees the "Succeed" status of the "Runs" tab for "second" run
#    Then user sees the "Finished" status in the "Tasks" tab


  @clearIndexedDb
  Scenario: Check the task data of last created task with two runs in the tabs
    Given user goes to the "Backtesting Manager" page with the backend server parameter
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user selects last created task with two runs in the "Tasks" table
    And user sees the data of two runs on the "Tasks" tab
    And user sees the data of two runs on the "Runs" tab
    When user selects the "Configs" tab on the "Backtesting" page
    And user selects the "first" run on the "Runs" tab
    And user sees the data "first" run on the "Configs" tab
    And user selects the "second" run on the "Runs" tab
    And user sees the data "second" run on the "Configs" tab
    When user selects the "Product Logs" tab on the "Backtesting" page
    And user clicks "Server Filter" button And sees the "Server Filter" panel
    And user selects the "first" run on the "Runs" tab
    And user sees the data "first" run in the "Product Logs" tab
    And user selects the "second" run on the "Runs" tab
    And user sees the data "second" run in the "Product Logs" tab
    When user selects the "Runs Info" tab on the "Backtesting" page
    Then user sees the data of two runs on the "Runs Info" tab


  @clearIndexedDb
  Scenario: Checking the visibility indicators of last created task with two runs in the "Runs Info" tab
    Given user goes to the "Backtesting Manager" page with the backend server parameter
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user selects last created task with two runs in the "Tasks" table
    And user selects the "first" run on the "Runs" tab
    And user selects the "Runs Info" tab on the "Backtesting" page
    When user types "adausdt|HuobiSpot.l1.ask,ETHBTC|BinanceSpot.l1.ask" in the "Score indicator names" input in the "Runs" tab
    And user sees value "adausdt|HuobiSpot.l1.bid" indicator in the "Runs Info" tab
    Then user sees value "ETHBTC|BinanceSpot.l1.ask" indicator in the "Runs Info" tab


  @clearIndexedDb
  Scenario: Checking the visibility indicators of last created task with two runs in the "Indicators" tab
    Given user goes to the "Backtesting Manager" page with the backend server parameter
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user selects last created task with two runs in the "Tasks" table
    And user selects the "Indicators" tab on the "Backtesting" page
    And user selects the "first" run on the "Runs" tab
    When user types "HuobiSpot.l1.bid" in the input field
    And user sees the "HuobiSpot.l1.bid" in "Name" column of table
    Then user sees the "0.356056" in "Value" column of table
    And user selects the "second" run on the "Runs" tab
    When user types "BinanceSpot.l1.ask" in the input field
    And user sees the "BinanceSpot.l1.ask" in "Name" column of table
    Then user sees the "0.069841" in "Value" column of table


  @clearIndexedDb
  Scenario: Checking the visibility indicators and "No Rows To Show" of last created task with two runs in the "Indicators" tab
    Given user goes to the "Backtesting Manager" page with the backend server parameter
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user selects last created task with two runs in the "Tasks" table
    And user selects the "Indicators" tab on the "Backtesting" page
    And user selects the "first" run on the "Runs" tab
    When user types "HuobiSpot.l1.bid" in the input field
    And user sees the "HuobiSpot.l1.bid" in "Name" column of table
    When user sees the "0.356056" in "Value" column of table
    And user selects the "second" run on the "Runs" tab
    Then user types "HuobiSpot.l1.bid" in the input field
    And user sees "No Rows To Show" in the table


  @clearIndexedDb
  Scenario: Checking the visibility "No Rows To Show" and indicators of last created task with two runs in the "Indicators" tab
    Given user goes to the "Backtesting Manager" page with the backend server parameter
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user selects last created task with two runs in the "Tasks" table
    And user selects the "Indicators" tab on the "Backtesting" page
    And user selects the "first" run on the "Runs" tab
    When user types "BinanceSpot.l1.ask" in the input field
    And user sees "No Rows To Show" in the table
    And user selects the "second" run on the "Runs" tab
    When user types "BinanceSpot.l1.ask" in the input field
    And user sees the "BinanceSpot.l1.ask" in "Name" column of table
    Then user sees the "0.069841" in "Value" column of table

