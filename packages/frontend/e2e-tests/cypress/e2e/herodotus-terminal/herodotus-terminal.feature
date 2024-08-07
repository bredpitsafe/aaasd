Feature: e2e tests: "Herodotus Terminal" page test suit. I as User checks the functionality of "Herodotus Trades" page

  Background:
    Given user selects the "default" server

  @clearIndexedDb
  Scenario: Checking visible "Robots" menu
    Given user goes to the "Herodotus Terminal" page by name "HerodotusMulti"
    And user sees the "Authorization" page and logs in as a "Frontend" user
    When user sees the "Herodotus Terminal" page
    And user clicks on "Robots" menu button
    Then user sees "HerodotusMulti,Herodotus" in the "Robots" menu


  @clearIndexedDb
  Scenario: Checking selection robot in the "Robots" menu
    Given user goes to the "Herodotus Terminal" page by name "HerodotusMulti"
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user sees the "Herodotus Terminal" page
    And user clicks on "Robots" menu button
    When user selects the "Herodotus" robot in the "Robots" menu
    And user on the "Herodotus Terminal" page of the "Herodotus" robot
    When user selects the "HerodotusMulti" robot in the "Robots" menu
    And user on the "Herodotus Terminal" page of the "HerodotusMulti" robot
    Then user sees the "Herodotus Terminal" page


  @clearIndexedDb
  Scenario: Checking the functionality a "Status Messages" tab
    Given user goes to the "Herodotus Terminal" page by name "HerodotusMulti"
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user clicks the "Reset Layout" button in the menu
    And user adds a new "Status Messages" tab in the menu
    And user clicks on "Robots" menu button
    When user selects the "Herodotus" robot in the "Robots" menu
    Then user sees a new message in the "Status Messages" tab


  @clearIndexedDb
  Scenario: Checking visible "Add Task" tab
    Given user goes to the "Herodotus Terminal" page by name "HerodotusMulti"
    And user sees the "Authorization" page and logs in as a "Frontend" user
    Then user sees the "Herodotus Terminal" page
    When user opens the "Add Task" tab in the "Herodotus Terminal" page
    And user sees the "Add Task" tab in the "Herodotus Terminal" page
    And user clicks the "Reset Layout" button in the "Herodotus Terminal" page
    Then user not sees the "Add Task" tab in the "Herodotus Terminal" page


#  @clearIndexedDb
#  Scenario Outline: Checking data a task with id "<Id>" in the "<NameTab>" tab
#    Given user goes to the "Herodotus Terminal" page by name "HerodotusMulti"
#    And user deletes archive tasks
#    And user archive active tasks
#    When user sees the task data with id "<Id>" in the "<NameTab>" tab
#    And user clicks on the first "Arrow" button in the "<NameTab>" tab
#    Then user sees additional task data with id "<Id>" in the "<NameTab>" tab
#
#    Examples:
#      | Id    | NameTab      |
#      | 20668 | Active Tasks |
#
#
#  @clearIndexedDb
#  Scenario: Checking "Started" and "Paused" a task via the button
#    Given user goes to the "Herodotus Terminal" page by name "HerodotusMulti"
#    And user sees the "Authorization" page and logs in as a "Frontend" user
#    And user sees the "Herodotus Terminal" page
#    And user deletes archive tasks
#    And user archive active tasks
#    And user selects the task by id "20668" and selects in the context menu of "Clone" in the "Archived Tasks" tab
#    And user confirms the creation of the task
#    And user sees "paused" status in the table on the "Active Tasks" tab
#    And user clicks the "paused" button in the "Active Tasks" table
#    And user sees the "has been started" success message
#    And user sees "started" status in the table on the "Active Tasks" tab
#    And user clicks the "started" button in the "Active Tasks" table
#    And user sees the "has been paused" success message
#    Then user sees "paused" status in the table on the "Active Tasks" tab
#
#
#  @clearIndexedDb
#  Scenario: Checking clone a task via the context menu in ths "Active Tasks" tab
#    Given user goes to the "Herodotus Terminal" page by name "HerodotusMulti"
#    And user sees the "Authorization" page and logs in as a "Frontend" user
#    And user sees the "Herodotus Terminal" page
#    And user deletes archive tasks
#    And user archive active tasks
#    And user selects the task by id "20668" and selects in the context menu of "Clone" in the "Archived Tasks" tab
#    And user confirms the creation of the task
#    When user sees the "has been cloned" success message
#    And user sees a new task in ths "Active Tasks" tab
#    And user sees "paused" status in the table on the "Active Tasks" tab
#    And user clicks on the last "Arrow" button in the "Active Tasks" tab
#    Then user checks a new task in ths "Active Tasks" tab


  @clearIndexedDb
  Scenario: Checking fill form from this task via the context menu in the "Active Tasks" tab
    Given user goes to the "Herodotus Terminal" page by name "HerodotusMulti"
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user sees the "Herodotus Terminal" page
    And user deletes archive tasks
    And user archive active tasks
    And user selects the task by id "20668" and selects in the context menu of "Fill form from this task" in the "Archived Tasks" tab
    And  user sees the filled fields the "Add Task" tab
    And user selects value "Quote" in the "Currency Type" input
    When user click "Add Task" button
    And user sees the "Task has been added" success message
    And user clicks the "Reset Layout" button in the "Herodotus Terminal" page
    And user sees a new task in ths "Active Tasks" tab
    And user sees "paused" status in the table on the "Active Tasks" tab
    And user clicks on the last "Arrow" button in the "Active Tasks" tab
    Then user checks a new task in ths "Active Tasks" tab


  @clearIndexedDb
  Scenario Outline: Checking the row download by "<NameButton>" button in the "<NameTab>" tab
    Given user goes to the "Herodotus Terminal" page by name "HerodotusMulti"
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user sees the "Herodotus Terminal" page
    And user archive active tasks
    And user deletes archive tasks
    And user selects task by id "<Id>" in the "<NameTab>" tab
    When user clicks on the "<NameButton>" button in the "<NameTab>" tab
    Then user sees the "<SuccessMessage>" success message
    And user checks the downloaded file with file "<NameFile>"

    Examples:
      | NameButton | SuccessMessage                           | Id    | NameTab        | NameFile                              |
      | CSV        | 1 table rows copied to clipboard as CSV  | 20668 | Archived Tasks | herodotus-terminal/archived-task.csv  |
      | JSON       | 1 table rows copied to clipboard as JSON | 20668 | Archived Tasks | herodotus-terminal/archived-task.json |


  @clearIndexedDb
  Scenario Outline: Checking the row download by "<NameExport>" button in the "<NameTab>" tab
    Given user goes to the "Herodotus Terminal" page by name "HerodotusMulti"
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user sees the "Herodotus Terminal" page
    And user deletes archive tasks
    When user selects task by id "<Id>" in the "<NameTab>" tab
    Then user selects the task by id "<Id>" and selects in the context menu of "Export" and "<NameExport>" in the "<NameTab>" tab

    Examples:
      | NameExport    | Id    | NameTab          |
      | CSV Export    | 20668 | Archived Tasks   |
      | Excel Export  | 20668 | Archived Tasks   |