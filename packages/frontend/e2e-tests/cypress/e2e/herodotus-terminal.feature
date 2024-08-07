Feature: e2e tests: "Herodotus Terminal" page test suit. I as User checks the functionality of "Herodotus Trades" page

  Background:
    Given user selects the "default" server

  @clearIndexedDb
  Scenario Outline: Checking the selection in the context menu "Charts (new window)" in the "<NameTab>" tab
    Given user goes to the "Herodotus Terminal" page by name "HerodotusMulti"
    And user clicks on the first "Arrow" button in the "<NameTab>" tab
    And user selects task by id "<Id>" in the "<NameTab>" tab
    Then user selects the task by id "<Id>" and selects in the context menu of "Charts (new window)" in the "<NameTab>" tab
    And user goes to the "Herodotus Terminal" page by name "HerodotusMulti"

    Examples:
      | Id  | NameTab        |
      | 71  | Active Tasks   |
      | 525 | Archived Tasks |


  @clearIndexedDb
  Scenario Outline: Checking the selection in the context menu "Trades (new window)" in the "<NameTab>" tab
    Given user goes to the "Herodotus Terminal" page by name "HerodotusMulti"
    And user clicks on the first "Arrow" button in the "<NameTab>" tab
    And user selects task by id "<Id>" in the "<NameTab>" tab
    Then user selects the task by id "<Id>" and selects in the context menu of "Trades (new window)" in the "<NameTab>" tab
    And user goes to the "Herodotus Terminal" page by name "HerodotusMulti"

    Examples:
      | Id  | NameTab        |
      | 71  | Active Tasks   |
      | 525 | Archived Tasks |

