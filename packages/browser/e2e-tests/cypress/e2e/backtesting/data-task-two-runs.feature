Feature: e2e tests: "BM" page test suit. I as User check the creation of a task with a two runs

  Background:
    Given user selects the "autotest" server

  @clearIndexedDb
  Scenario: Check the creation of a task with "Two Runs"
    Given user goes to the "Backtesting Manager" page with the backend server parameter
    And user sees "Tasks" tab on the "Backtesting" page
    And user selects a "TaskTwoRuns" task and opens "Add Task" via the context menu
    And user sees the "Clone" tab in the "Backtesting Manager" page
    And user clears and types a random value in the "NameTask_TwoRuns" task input
    And user clicks the "Create and Run" button in the "Add Task" tab
    When user sees the "Backtesting Task created successfully" success message
    When user sees the "Running" status in the "Tasks" tab
    And user sees the "Initializing" status of the "Runs" tab for "first" run
    And user sees the "Succeed" status of the "Runs" tab for "first" run
    And user sees the "Initializing" status of the "Runs" tab for "second" run
    And user sees the "Succeed" status of the "Runs" tab for "second" run
    Then user sees the "Finished" status in the "Tasks" tab


  @clearIndexedDb
  Scenario: Check the task data with "Two Runs" in the respective tabs
    Given user goes to the "Backtesting Manager" page with the backend server parameter
    And user selects last created task with two runs in the "Tasks" table
    And user selects the "Configs" tab on the "Backtesting" page
    And user selects the "first" run on the "Runs" tab
    When user sees the data "first" run on the "Configs" tab
    And user selects the "second" run on the "Runs" tab
    And user sees the data "second" run on the "Configs" tab
    And user selects the "Product Logs" tab on the "Backtesting" page
    And user clicks "Server Filter" button And sees the "Server Filter" panel
    And user selects the "first" run on the "Runs" tab
    And user sees the data "first" run in the "Product Logs" tab
    And user selects the "second" run on the "Runs" tab
    And user sees the data "second" run in the "Product Logs" tab
    And user selects the "Runs Info" tab on the "Backtesting" page
    Then user sees the data "two runs" in the "Run Info" tab


  @clearIndexedDb
  Scenario: Check the visibility of the data of the "Two Runs" on the "Runs Info" tab
    Given user goes to the "Backtesting Manager" page with the backend server parameter
    And user sees "Tasks" tab on the "Backtesting" page
    And user selects task for "Two Runs" in the "Tasks" table
    And user sees the data of two runs on the "Task" tab
    And user sees the data of two runs on the "Runs" tab
    When user selects the "Runs Info" tab on the "Backtesting" page
    Then user sees the data of two runs on the "Runs Info" tab


  @clearIndexedDb
  Scenario: Check the visibility of the data of the "Two Runs" on the "Runs Configs" table
    Given user goes to the "Backtesting Manager" page with the backend server parameter
    And user sees "Tasks" tab on the "Backtesting" page
    And user selects task for "Two Runs" in the "Tasks" table
    And user selects the "Configs" tab on the "Backtesting" page
    And user selects the "first" run on the "Runs" tab
    When user sees the data "first" run on the "Configs" tab
    And user selects the "second" run on the "Runs" tab
    Then user sees the data "second" run on the "Configs" tab


  @clearIndexedDb
  Scenario: Check the visibility of the data of the "Two Runs" on the "Product Logs" table
    Given user goes to the "Backtesting Manager" page with the backend server parameter
    And user sees "Tasks" tab on the "Backtesting" page
    And user selects task for "Two Runs" in the "Tasks" table
    And user selects the "Product Logs" tab on the "Backtesting" page
    And user clicks "Server Filter" button And sees the "Server Filter" panel
    And user selects the "first" run on the "Runs" tab
    When user sees the data "first" run in the "Product Logs" tab
    And user selects the "second" run on the "Runs" tab
    Then user sees the data "second" run in the "Product Logs" tab