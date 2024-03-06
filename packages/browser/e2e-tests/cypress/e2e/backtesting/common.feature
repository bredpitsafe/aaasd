Feature: e2e tests: "BM" page test suit. I as User checks the functionality of "Tasks" tap

  Background:
    Given user selects the "autotest" server

  @clearIndexedDb
  Scenario: Checking for deleting indicators in the "Runs" tab
    Given user goes to the "Backtesting Manager" page with the backend server parameter
    And user selects task for "Update" in the "Tasks" table
    When user clears and save empty indicators in the "Runs" tab
    And user not sees indicators in the "Runs" tab
    And user not sees indicators in the "Details" tab
    And user selects last created task in the "Tasks" table
    And user selects task for "Update" in the "Tasks" table
    Then user not sees indicators in the "Runs" tab
    And user not sees indicators in the "Details" tab


  @clearIndexedDb
  Scenario: Checking for changing indicators in the "Runs" tab
    Given user goes to the "Backtesting Manager" page with the backend server parameter
    And user selects task for "Update" in the "Tasks" table
    When user types random indicators in the "Runs" tab
    And user sees indicators in the "Runs" tab
    And user sees indicators in the "Details" tab
    And user selects last created task in the "Tasks" table
    When user selects task for "Update" in the "Tasks" table
    And user sees indicators in the "Runs" tab
    Then user sees indicators in the "Details" tab


  @clearIndexedDb
  Scenario: Checking the status update in the "Tasks" tab after turning off the internet
    Given user goes to the "Backtesting Manager" page with the backend server parameter
    And user selects task for "clone" in the "Tasks" table
    And user selects a "TaskOneRun" task and opens "Add Task" via the context menu
    And user sees the "Clone" tab in the "Backtesting Manager" page
    And user clears and types a random value in the "NameTask_OneRun" task input
    And user clicks the "Create and Run" button in the "Add Task" tab
    And user sees the "Backtesting Task created successfully" success message
    And user sees "created task" in the "Tasks" table
    When user sees the "Running" status in the "Tasks" tab
    And user sets the Internet off
    And user waits for "20" seconds
    And user sets the Internet on
    And user waits for "10" seconds
    Then user sees the "Finished" status in the "Tasks" tab
    And user deletes created tasks in the "Tasks" table


  @clearIndexedDb
  Scenario: Checking the deletion of a task in the "Tasks" table
    Given user goes to the "Backtesting Manager" page with the backend server parameter
    And user selects first task for "delete" in the "Tasks" table
    When user deletes the selected task in the "Tasks" table
    Then user not sees "deleted task" in the "Tasks" table


  @clearIndexedDb
  Scenario: Checking for updates link in the "Dashboards" tab
    Given user goes to the "Backtesting Manager" page with the backend server parameter
    And user selects task for "Update" in the "Tasks" table
    When user sees that the "Dashboard" link contains the "20160" number of the "Run"
    And user selects task for "One Run" in the "Tasks" table
    When user sees that the "Dashboard" link contains the "21080" number of the "Run"
    And user selects last created task in the "Tasks" table
    And user sees that the "Dashboard" link has changed
    Then user sees that the "Dashboard" link is equal to the number of the "Run"


  @clearIndexedDb
  Scenario: Checking create task via the context menu in the "Tasks" tab
    Given user goes to the "Backtesting Manager" page with the backend server parameter
    And user selects a last created task and remembers its name in the "Tasks" table
    And user runs a last created task selects "Run again" in the context menu
    When user sees the "Backtesting Task created successfully" success message
    And user sees the "Running" status in the "Tasks" tab
    And user sees two tasks with the same name in the "Tasks" table
    And user stops a last created task selects "Stop" in the context menu
    Then user sees the "Canceled" status in the "Tasks" tab
    And user sees the "Stopped" status in the "Runs" tab
    And user deletes the selected task in the "Tasks" table

