Feature: e2e tests: "Herodotus robot" page test suit. I as User checks the functionality of "Add Task" tab of the "Herodotus" robot

  Background:
    Given user selects the "hypercube" server

  @clearIndexedDb
  Scenario Outline: "Herodotus" robot. Creating a new task type "<TaskType>" using exchange buy "<ExchangeBuy>" and sell "<ExchangeSell>"
    Given user goes on the "Trading Servers Manager" page with the selected "Add Task" tab in the "6017" robot
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user sets the "<TaskType>" task type
    And user sets random data in the "BuySell" task:
      | exchangeBuy   | accountBuy   | exchangeSell   | accountSell   |
      | <ExchangeBuy> | <AccountBuy> | <ExchangeSell> | <AccountSell> |
    And user sets a random valid roles in the instruments
    When user click "Add Task" button
    Then user sees the "Task has been added" success message

    Examples:
      | TaskType | ExchangeBuy  | AccountBuy       | ExchangeSell  | AccountSell       |
      | BuySell  | BinanceSpot  | binanceSpot.e2e  | KucoinSpot    | kucoinSpot.e2e    |
      | BuySell  | BinanceSwap  | binanceSwap.e2e  | OkexSwap      | okexSwap.e2e      |
      | BuySell  | BithumbSpot  | bithumbSpot.e2e  | UpbitSpot     | upbitSpot.e2e     |
      | BuySell  | BybitSpot    | bybitSpot.e2e    | GateioSpot    | gateioSpot.e2e    |
      | BuySell  | BybitSwap    | bybitSwap.e2e    | Deribit       | deribit.e2e       |
      | BuySell  | Deribit      | deribit.e2e      | BybitSwap     | bybitSwap.e2e     |
      | BuySell  | GateioSpot   | gateioSpot.e2e   | BinanceSpot   | binanceSpot.e2e   |
      | BuySell  | KrakenSpot   | krakenSpot.e2e   | OkexSpot      | okexSpot.e2e      |
      | BuySell  | KucoinSpot   | kucoinSpot.e2e   | BybitSpot     | bybitSpot.e2e     |
      | BuySell  | OkexSpot     | okexSpot.e2e     | KucoinSpot    | kucoinSpot.e2e    |
      | BuySell  | OkexSwap     | okexSwap.e2e     | BinanceSwap   | binanceSwap.e2e   |


  @clearIndexedDb
  Scenario: Archived and deleted new tasks
    Given user goes on the "Trading Servers Manager" page with the selected "Active Tasks" tab in the "6017" robot
    And user sees the "Authorization" page and logs in as a "Frontend" user
    When user archive active tasks
#    And user selects the "Archived Tasks" tab on the "Trading Servers Manager" page
#    Then user deletes all archive tasks