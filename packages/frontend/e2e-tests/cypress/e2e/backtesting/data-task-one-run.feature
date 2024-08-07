Feature: e2e tests: "BM" page test suit. I as User check the creation of a task with a one run

  Background:
    Given user selects the "autotest" server

  @clearIndexedDb
  Scenario: Create a task via the context menu. Checking run statuses new task
    Given user goes to the "Backtesting Manager" page with the backend server parameter
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user deletes created tasks in the "Tasks" table
    And user selects a "TaskOneRun" task and opens "Add Task" via the context menu
    And user sees the "Clone" tab in the "Backtesting Manager" page
    And user clears and types a random value in the "NameTask_OneRun" task input
    And user clicks the "Create and Run" button in the "Add Task" tab
    When user sees the "Backtesting Task created successfully" success message
#    And user sees "created task" in the "Tasks" table https://bhft-company.atlassian.net/browse/FRT-2523
#    When user sees the "Running" status in the "Tasks" tab
#    Then user sees the "Initializing" status in the "Runs" tab
#    And user sees the "Finished" status in the "Tasks" tab
#    And user sees the "Succeed" status in the "Runs" tab
#    And user sees the data of the "new task" in the "Tasks" tab


  @clearIndexedDb
  Scenario: Checking the calendar date in the "Product Logs" tab of last creating task
    Given user goes to the "Backtesting Manager" page with the backend server parameter
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user selects last created task in the "Tasks" table
    And user selects the "Product Logs" tab on the "Backtesting" page
    When user clicks "Server Filter" button And sees the "Server Filter" panel
    Then user checks the date in the calendar from "dataTask" object


  @clearIndexedDb
  Scenario: Checking the created run date in the "Product Logs" tab of last creating task
    Given user goes to the "Backtesting Manager" page with the backend server parameter
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user selects last created task in the "Tasks" table
    When user selects the "Product Logs" tab on the "Backtesting" page
    Then user sees the task data in the "Product Logs" tab from "dataTask" object


  @clearIndexedDb
  Scenario Outline: Checking the visibility of task "<NameIndicator>" indicator in the "Runs" tab of last creating task
    Given user goes to the "Backtesting Manager" page with the backend server parameter
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user selects last created task in the "Tasks" table
    When user types "<NameIndicator>" indicator in the "Indicator name" input
    Then user sees value "<NameIndicator>" indicator in the "Runs" tab

    Examples:
      | NameIndicator                      |
      | accountant.HB.backtestAccount.ADA  |
      | accountant.HB.backtestAccount.USDT |


  @clearIndexedDb
  Scenario: Checking the visibility two "adausdt|HuobiSpot.l1.bid", "adausdt|HuobiSpot.l1.ask" indicators in the "Runs" tab of last creating task
    Given user goes to the "Backtesting Manager" page with the backend server parameter
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user selects last created task in the "Tasks" table
    When user types "adausdt|HuobiSpot.l1.bid,adausdt|HuobiSpot.l1.ask" in the "Score indicator name" input in the "Runs" tab
    And user sees value "adausdt|HuobiSpot.l1.bid" indicator in the "Runs" tab
    Then user sees value "adausdt|HuobiSpot.l1.ask" indicator in the "Runs" tab


  @clearIndexedDb
  Scenario Outline: Checking the visibility "<NameIndicator>" indicator in the "Indicators" tab of last creating task
    Given user goes to the "Backtesting Manager" page with the backend server parameter
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user selects last created task in the "Tasks" table
    And user selects the "Indicators" tab on the "Backtesting" page
    When user types "<NameIndicator>" in the input field
    And user sees the "<NameIndicator>" in "Name" column of table
    Then user sees the "<ValueIndicator>" in "Value" column of table

    Examples:
      | NameIndicator     | ValueIndicator  |
      | backtest.acc.BTC  | 10000000000     |
      | HuobiSpot.l1.ask  | 0.362481        |


  @clearIndexedDb
  Scenario: Checking the visibility task data of last created task in the "Runs" tab
    Given user goes to the "Backtesting Manager" page with the backend server parameter
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user sees "Tasks" tab on the "Backtesting" page
    And user selects last created task in the "Tasks" table
    And user selects the "Runs" tab on the "Backtesting" page
    And user sees the data "task" in the "Tasks" tab
    When user sees "Runs" tab on the "Backtesting" page
    Then user sees the data "run" in the "Runs" tab


  @clearIndexedDb
  Scenario: Checking the visibility indicators of last created task in the "Indicators" tab
    Given user goes to the "Backtesting Manager" page with the backend server parameter
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user selects last created task in the "Tasks" table
    And user selects the "Indicators" tab on the "Backtesting" page
    And user types "backtestAccount" in the input field
    When user sees the "backtestAccount" in "Name" column of table
    And user clicks on the "1h" time button in the "Indicators" tab
    Then user sees "No Rows To Show" in the table


  @clearIndexedDb
  Scenario: Checking the functionality of "Case Sensitive" button in the "Indicators" tab
    Given user goes to the "Backtesting Manager" page with the backend server parameter
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user selects last created task in the "Tasks" table
    And user selects the "Indicators" tab on the "Backtesting" page
    And user types "BacktestAccount" in the input field
    When user sees the "backtestAccount" in "Name" column of table
    And user clicks on the "Case Sensitive" switch button in the "Indicators" tab
    Then user sees "No Rows To Show" in the table