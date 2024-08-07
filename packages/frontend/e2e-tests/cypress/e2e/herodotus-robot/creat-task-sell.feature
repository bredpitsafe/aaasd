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
      | Sell     | BinanceCoinSwap | binanceCoinSwap.e2e |
      | Sell     | BinanceSpot     | binanceSpot.e2e     |
      | Sell     | BinanceSwap     | binanceSwap.e2e     |
      | Sell     | BithumbSpot     | bithumbSpot.e2e     |
      | Sell     | BybitSpot       | bybitSpot.e2e       |
      | Sell     | BybitSwap       | bybitSwap.e2e       |
      | Sell     | Deribit         | deribit.e2e         |
      | Sell     | GateioSpot      | gateioSpot.e2e      |
      | Sell     | KrakenSpot      | krakenSpot.e2e      |
      | Sell     | KucoinSpot      | kucoinSpot.e2e      |
      | Sell     | OkexSpot        | okexSpot.e2e        |
      | Sell     | OkexSwap        | okexSwap.e2e        |
      | Sell     | UpbitSpot       | upbitSpot.e2e       |


  @clearIndexedDb
  Scenario: Archived and deleted new tasks
    Given user goes on the "Trading Servers Manager" page with the selected "Active Tasks" tab in the "6017" robot
    And user sees the "Authorization" page and logs in as a "Frontend" user
    When user archive active tasks
#    And user selects the "Archived Tasks" tab on the "Trading Servers Manager" page
#    Then user deletes all archive tasks