Feature: e2e tests: "Herodotus Trades" page test suit. I as User checks the functionality of "Herodotus Trades" page

  @clearIndexedDb
  Scenario: Checking visibly the "Herodotus Trades" page
    Given user goes to the "Herodotus Trades" page
    Then user sees the "Herodotus Trades" page


#  @clearIndexedDb
#  Scenario Outline: Checking the opening of the task table with id "<Id>"
#    Given user goes to the "Herodotus Trades" page of the task with id "<Id>"
#    When user sees the "Herodotus Trades" page
#    Then user sees the task value in the table with id "<Id>"
#
#    Examples:
#      | Id      |
#      | 71      |
#      | 525     |

