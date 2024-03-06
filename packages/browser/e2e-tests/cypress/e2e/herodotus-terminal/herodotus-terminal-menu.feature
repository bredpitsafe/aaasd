Feature: e2e tests: "Herodotus Terminal" page test suit. I as User checks the functionality of "Herodotus Trades" page

  Background:
    Given user selects the "qa" server

  @clearIndexedDb
  Scenario Outline: Checking the visibility of the context menu in the "<NameTab>" tab
    Given user goes to the "Herodotus Terminal" page by index "1517"
    And  user sees the "Authorization" page and logs in as a "Frontend" user
    When user sees the "Herodotus Terminal" page
    Then user selects the task by id "<Id>" and checks visibility of the context menu in the "<NameTab>" tab

    Examples:
      | Id   | NameTab         |
      | 1    | Active Tasks    |
      | 2    | Archived Tasks  |


  @clearIndexedDb
  Scenario Outline: Checking the selection in the context menu "Charts" in the "<NameTab>" tab
    Given user goes to the "Herodotus Terminal" page by index "1517"
    And  user sees the "Authorization" page and logs in as a "Frontend" user
    And user sees the "Herodotus Terminal" page
    When user selects the task by id "<Id>" and selects in the context menu of "Charts" in the "<NameTab>" tab
    Then user sees the new "<NameCharts>" tab

    Examples:
      | Id    | NameTab         | NameCharts        |
      | 1     | Active Tasks    | 1: Sell 0.034 ETH |
      | 2     | Archived Tasks  | 2: Buy 0.056 BTC  |


  Scenario Outline: Checking the selection in the context menu "Trades" in the "<NameTab>" tab
    Given user goes to the "Herodotus Terminal" page by index "1517"
    And  user sees the "Authorization" page and logs in as a "Frontend" user
    When user sees the "Herodotus Terminal" page
    And user selects the task by id "<Id>" and selects in the context menu of "Trades" in the "<NameTab>" tab
    Then user sees the new "<NameTrades>" tab

    Examples:
      | Id    | NameTab         | NameTrades        |
      | 1     | Active Tasks    | 1: Sell 0.034 ETH |
      | 2     | Archived Tasks  | 2: Buy 0.056 BTC  |


  @clearIndexedDb
  Scenario Outline: Checking fill form from this task via the context menu in the "Active Tasks" tab
    Given user goes to the "Herodotus Terminal" page by index "1517"
    And  user sees the "Authorization" page and logs in as a "Frontend" user
    When user sees the "Herodotus Terminal" page
    And user selects the task by id "<Id>" and selects in the context menu of "Fill form from this task" in the "<NameTab>" tab
    And  user sees the filled fields the "Add Task" tab
    Then user selects value "Quote" in the "Currency Type" input

    Examples:
      | Id    | NameTab         |
      | 3     | Active Tasks    |
      | 4     | Archived Tasks  |


  @clearIndexedDb
  Scenario: Checking "Started" and "Paused" a task via the context menu
    Given user goes to the "Herodotus Terminal" page by index "1517"
    And  user sees the "Authorization" page and logs in as a "Frontend" user
    And user sees the "Herodotus Terminal" page
    And user "paused" all "started" tasks
    When user sees "paused" status in the table on the "Active Tasks" tab
    And user not sees "started" status in the table on the "Active Tasks" tab
    And user selects the task by id "3" and selects in the context menu of "Start" in the "Active Tasks" tab
    And user sees the successful "Generic command" messages
    And user sees "started" status in the table on the "Active Tasks" tab
    And user selects the task by id "3" and selects in the context menu of "Pause" in the "Active Tasks" tab
    And user sees the successful "Generic command" messages
    Then user sees "paused" status in the table on the "Active Tasks" tab

