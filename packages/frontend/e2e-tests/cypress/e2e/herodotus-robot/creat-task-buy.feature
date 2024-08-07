Feature: e2e tests: "Herodotus robot" page test suit. I as User checks the functionality of "Add Task" tab of the "Herodotus" robot

  Background:
    Given user selects the "hypercube" server

  @clearIndexedDb
  Scenario Outline: "Herodotus" robot. Creating a new task type "<TaskType>" using exchange "<Exchange>"
    Given user goes on the "Trading Servers Manager" page with the selected "Add Task" tab in the "6017" robot
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user sets the "<TaskType>" task type
    And user sets random data in the task:
      | exchange   | account   |
      | <Exchange> | <Account> |
    When user click "Add Task" button
    Then user sees the "Task has been added" success message

    Examples:
      | TaskType | Exchange        | Account             |
      | Buy      | BinanceCoinSwap | binanceCoinSwap.e2e |
      | Buy      | BinanceSpot     | binanceSpot.e2e     |
      | Buy      | BinanceSwap     | binanceSwap.e2e     |
      | Buy      | BithumbSpot     | bithumbSpot.e2e     |
      | Buy      | BybitSpot       | bybitSpot.e2e       |
      | Buy      | BybitSwap       | bybitSwap.e2e       |
      | Buy      | Deribit         | deribit.e2e         |
      | Buy      | GateioSpot      | gateioSpot.e2e      |
      | Buy      | KrakenSpot      | krakenSpot.e2e      |
      | Buy      | KucoinSpot      | kucoinSpot.e2e      |
      | Buy      | OkexSpot        | okexSpot.e2e        |
      | Buy      | OkexSwap        | okexSwap.e2e        |
      | Buy      | UpbitSpot       | upbitSpot.e2e       |


  @clearIndexedDb
  Scenario: Archived and deleted new tasks
    Given user goes on the "Trading Servers Manager" page with the selected "Active Tasks" tab in the "6017" robot
    And user sees the "Authorization" page and logs in as a "Frontend" user
    When user archive active tasks
#    And user selects the "Archived Tasks" tab on the "Trading Servers Manager" page
#    Then user deletes all archive tasks