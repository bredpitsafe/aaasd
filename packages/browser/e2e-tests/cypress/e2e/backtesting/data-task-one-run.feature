Feature: e2e tests: "BM" page test suit. I as User check the creation of a task with a one run

  Background:
    Given user selects the "autotest" server

  @clearIndexedDb
  Scenario: Create a task via the context menu. Checking run statuses new task
    Given user goes to the "Backtesting Manager" page with the backend server parameter
    And user selects a "TaskOneRun" task and opens "Add Task" via the context menu
    And user sees the "Clone" tab in the "Backtesting Manager" page
    And user clears and types a random value in the "NameTask_OneRun" task input
    And user clicks the "Create and Run" button in the "Add Task" tab
    When user sees the "Backtesting Task created successfully" success message
    And user sees "created task" in the "Tasks" table
    When user sees the "Running" status in the "Tasks" tab
    Then user sees the "Initializing" status in the "Runs" tab
    And user sees the "Finished" status in the "Tasks" tab
    And user sees the "Succeed" status in the "Runs" tab
    And user sees the data of the "new task" in the "Tasks" tab


  @clearIndexedDb
  Scenario: Checking the opening of the "Product Logs" of last creating task. Checking the calendar date
    Given user goes to the "Backtesting Manager" page with the backend server parameter
    And user selects last created task in the "Tasks" table
    And user selects the "Product Logs" tab on the "Backtesting" page
    When user clicks "Server Filter" button And sees the "Server Filter" panel
    Then user checks the date in the calendar from "dataTask" object


  @clearIndexedDb
  Scenario: Checking the opening of the "Product Logs" of last creating task. Checking the data of the created run
    Given user goes to the "Backtesting Manager" page with the backend server parameter
    And user selects last created task in the "Tasks" table
    When user selects the "Product Logs" tab on the "Backtesting" page
    Then user sees the task data in the "Product Logs" tab from "dataTask" object


  @clearIndexedDb
  Scenario Outline: Checking the visibility of task "<NameIndicator>" indicator in the "Runs" tab
    Given user goes to the "Backtesting Manager" page with the backend server parameter
    And user selects last created task in the "Tasks" table
    When user types "<NameIndicator>" indicator in the "Indicator name" input
    Then user sees value "<NameIndicator>" indicator in the "Runs" tab

    Examples:
      | NameIndicator                      |
      | accountant.HB.backtestAccount.ADA  |
      | accountant.HB.backtestAccount.USDT |


  @clearIndexedDb
  Scenario: Checking the visibility of task two "adausdt|HuobiSpot.l1.bid", "adausdt|HuobiSpot.l1.ask" indicators in the "Runs" tab
    Given user goes to the "Backtesting Manager" page with the backend server parameter
    And user selects last created task in the "Tasks" table
    When user types "adausdt|HuobiSpot.l1.bid,adausdt|HuobiSpot.l1.ask" indicators in the "Indicator name" input
    And user sees value "adausdt|HuobiSpot.l1.bid" indicator in the "Runs" tab
    Then user sees value "adausdt|HuobiSpot.l1.ask" indicator in the "Runs" tab


  @clearIndexedDb
  Scenario: Checking the visibility of task data in the "Runs" tab
    Given user goes to the "Backtesting Manager" page with the backend server parameter
    And user sees "Tasks" tab on the "Backtesting" page
    And user selects task for "One Run" in the "Tasks" table
    And user selects the "Runs" tab on the "Backtesting" page
    And user sees the data "task" in the "Tasks" tab
    When user sees "Runs" tab on the "Backtesting" page
    Then user sees the data "run" in the "Runs" tab


  @clearIndexedDb
  Scenario: Checking the visibility of task data in the "Runs" tab
    Given user goes to the "Backtesting Manager" page with the backend server parameter
    When user selects task for "One Run" in the "Tasks" table
    Then user checks visibility of the context menu of the run

