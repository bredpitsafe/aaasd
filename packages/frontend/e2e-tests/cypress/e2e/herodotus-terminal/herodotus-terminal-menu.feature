Feature: e2e tests: "Herodotus Terminal" page test suit. I as User checks the functionality of "Herodotus Trades" page

  Background:
    Given user selects the "default" server

  @clearIndexedDb
  Scenario Outline: Checking the visibility of the context menu in the "<NameTab>" tab
    Given user goes to the "Herodotus Terminal" page by index "2217"
    And user sees the "Authorization" page and logs in as a "Frontend" user
    When user sees the "Herodotus Terminal" page
    Then user selects the task by id "<Id>" and checks visibility of the context menu in the "<NameTab>" tab

    Examples:
      | Id   | NameTab         |
      | 6    | Active Tasks    |
      | 4    | Archived Tasks  |


  @clearIndexedDb
  Scenario Outline: Checking the selection in the context menu "Charts" in the "<NameTab>" tab
    Given user goes to the "Herodotus Terminal" page by index "2217"
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user sees the "Herodotus Terminal" page
    When user selects the task by id "<Id>" and selects in the context menu of "Charts" in the "<NameTab>" tab
    Then user sees the new "<NameCharts>" tab

    Examples:
      | Id    | NameTab         | NameCharts       |
      | 6     | Active Tasks    | 6: Buy 0.02 BTC  |
      | 4     | Archived Tasks  | 4: Buy 0.01 BTC  |


  Scenario Outline: Checking the selection in the context menu "Trades" in the "<NameTab>" tab
    Given user goes to the "Herodotus Terminal" page by index "2217"
    And user sees the "Authorization" page and logs in as a "Frontend" user
    When user sees the "Herodotus Terminal" page
    And user selects the task by id "<Id>" and selects in the context menu of "Trades" in the "<NameTab>" tab
    Then user sees the new "<NameTrades>" tab

    Examples:
      | Id    | NameTab         | NameTrades       |
      | 6     | Active Tasks    | 6: Buy 0.02 BTC  |
      | 4     | Archived Tasks  | 4: Buy 0.01 BTC  |


  @clearIndexedDb
  Scenario Outline: Checking fill form from this task via the context menu in the "Active Tasks" tab
    Given user goes to the "Herodotus Terminal" page by index "2217"
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user sees the "Herodotus Terminal" page
    When user selects the task by id "<Id>" and selects in the context menu of "Fill form from this task" in the "<NameTab>" tab
    And  user sees the filled fields the "Add Task" tab
    Then user selects value "Quote" in the "Currency Type" input

    Examples:
      | Id    | NameTab         |
      | 18    | Active Tasks    |
      | 17    | Archived Tasks  |


  @clearIndexedDb
  Scenario: Checking "Started" and "Paused" a task via the context menu
    Given user goes to the "Herodotus Terminal" page by index "2217"
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user sees the "Herodotus Terminal" page
    And user "paused" all "started" tasks
    When user sees "paused" status in the table on the "Active Tasks" tab
    And user not sees "started" status in the table on the "Active Tasks" tab
    And user selects the task by id "9" and selects in the context menu of "Start" in the "Active Tasks" tab
    And user sees the "has been started" success message
    And user sees "started" status in the table on the "Active Tasks" tab
    And user selects the task by id "9" and selects in the context menu of "Pause" in the "Active Tasks" tab
    And user sees the "has been paused" success message
    Then user sees "paused" status in the table on the "Active Tasks" tab

