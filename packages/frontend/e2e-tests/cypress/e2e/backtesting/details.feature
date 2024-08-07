Feature: e2e tests: "BM" page test suit. I as User checks the functionality of "Tasks" tap

  Background:
    Given user selects the "autotest" server

  @clearIndexedDb
  Scenario: Checking the update of task data in the "Details" tab
    Given user goes to the "Backtesting Manager" page with the backend server parameter
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user selects task for "Update" in the "Tasks" table
    When user changes the task data in the "Details" tab
    And user sees "new task name" in the "Tasks" table
    Then user sees the data of the "updated task" in the "Tasks" tab


  @clearIndexedDb
  Scenario: Checking the update of a task in the "Details" tab and select other task
    Given user goes to the "Backtesting Manager" page with the backend server parameter
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user selects task for "Update" in the "Tasks" table
    And user changes the task data in the "Details" tab
    And user sees "new task name" in the "Tasks" table
    When user selects task for "One Run" in the "Tasks" table
    And user selects task for "Update" in the "Tasks" table
    Then user sees the data of the "updated task" in the "Tasks" tab


  @clearIndexedDb
  Scenario: Checking task cloning when clicking on the "CloneTask" button in the "Details" tab
    Given user goes to the "Backtesting Manager" page with the backend server parameter
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user selects a last created task and remembers its name in the "Tasks" table
    When user clicks on the "CloneTask" in the "Details" tab
    And user sees the "Clone" tab in the "Backtesting Manager" page
    Then user sees name selected task in the "Clone" tab


  @clearIndexedDb
  Scenario: Checking task deleting when clicking on the "DeleteTask" button in the "Details" tab
    Given user goes to the "Backtesting Manager" page with the backend server parameter
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user selects the "first task" for "delete" in the "Tasks" table
    When user clicks on the "DeleteTask" in the "Details" tab
    And user clicks on the "OK" button in the "delete task" modal
    Then user not sees "deleted task" in the "Tasks" table


  @clearIndexedDb
  Scenario: Checking task running and stopping when clicking on the "RunAgainTask" and "Stopped" button in the "Details" tab
    Given user goes to the "Backtesting Manager" page with the backend server parameter
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user selects a last created task and remembers its name in the "Tasks" table
    When user clicks on the "RunAgainTask" in the "Details" tab
    And user sees the "Running" status in the "Tasks" tab
    And user sees two tasks with the same name in the "Tasks" table
    When user clicks on the "StopTask" in the "Details" tab
    And user sees the "Canceled" status in the "Tasks" tab
    Then user sees the "Stopped" status in the "Runs" tab


  @clearIndexedDb
  Scenario Outline: Checking sets "<NameIndicator>" indicator in the "Details" tab
    Given user goes to the "Backtesting Manager" page with the backend server parameter
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user selects last created task in the "Tasks" table
    When user types "<NameIndicator>" indicator in the "Details" tab
    Then user sees value "<NameIndicator>" indicator in the "Runs" tab

    Examples:
      | NameIndicator                      |
      | accountant.HB.backtestAccount.ADA  |
      | accountant.HB.backtestAccount.USDT |

