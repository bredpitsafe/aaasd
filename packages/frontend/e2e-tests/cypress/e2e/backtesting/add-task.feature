Feature: e2e tests: "BM" page test suit. I as User checks the functionality of "Add Task" tap

  Background:
    Given user selects the "autotest" server

  @clearIndexedDb
  Scenario: Checking the opening "Add Task" tab
    Given user goes to the "Backtesting Manager" page with the backend server parameter
    And user sees the "Authorization" page and logs in as a "Frontend" user
    When user clicks the "Add Task" button in the menu "Backtesting Manager"
    Then user sees the "Add Task" tab in the "Backtesting Manager" page


  @clearIndexedDb
  Scenario: Checking the functionality "Reset Layout" button in the menu
    Given user goes to the "Backtesting Manager" page with the backend server parameter
    And user sees the "Authorization" page and logs in as a "Frontend" user
    When user clicks the "Add Task" button in the menu "Backtesting Manager"
    And user clicks the "Reset Layout" button in the menu
    Then user not sees the "Add Task" tab


  @clearIndexedDb
  Scenario: Checking the functionality selection tab in the "Add Task" tab
    Given user goes to the "Backtesting Manager" page with the backend server parameter
    And user sees the "Authorization" page and logs in as a "Frontend" user
    When user clicks the "Add Task" button in the menu "Backtesting Manager"
    And user checks the "Common" tab in the "Add Task" tab
    Then user checks the "Robots" tab in the "Add Task" tab


  @clearIndexedDb
  Scenario: Checking task creation via the "Add Task" tab
    Given user goes to the "Backtesting Manager" page with the backend server parameter
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user deletes created tasks in the "Tasks" table
    And user clicks the "Add Task" button in the menu "Backtesting Manager"
    And user types random value in the "Common" tab input
    And user types date in the calendar from "dataTask" object
    And user types date in the "Config Template" tab
    And user types date in the "Robots" tab
    And user clicks the "Create and Run" button in the "Add Task" tab
    When user sees the "Backtesting Task created successfully" success message
#    Then user sees "created task" in the "Tasks" table https://bhft-company.atlassian.net/browse/FRT-2523


  @clearIndexedDb
  Scenario: Checking the creation of a task via cloning from another server
    Given user goes to the "Backtesting Manager" page with the backend server "qa"
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user selects a "TaskOneRun" task and opens "Add Task" via the context menu
    And user sees the "Clone" tab in the "Backtesting Manager" page
    And user clears and types a random value in the "NameTask_OneRun" task input
    When user selects server "autotest" to run the task
    And user clicks the "Create and Run" button in the "Add Task" tab
    And user sees the "Backtesting Task created successfully" success message
    And user goes to the "Backtesting Manager" page with the backend server "autotest"
    And user clicks the "Reset Layout" button in the menu
    When user sees "created task" in the "Tasks" table
    Then user sees the data of the "new task" in the "Tasks" tab

