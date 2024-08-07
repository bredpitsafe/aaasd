Feature: e2e tests: "Herodotus robot" page test suit. I as User checks the functionality of "Add Task" tab of the "Herodotus" robot

  Background:
    Given user selects the "hypercube" server

  @clearIndexedDb
  Scenario Outline: "Herodotus" robot. Creating a new task type "<TaskType>" using exchanges buy "<ExchangeBuyOne>", "<ExchangeBuyTwo>" and sell "<ExchangeSellOne>", "<ExchangeSellTwo>"
    Given user goes on the "Trading Servers Manager" page with the selected "Add Task" tab in the "6017" robot
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user sets the "<TaskType>" task type
    And user sets random data in the "BuySell" task for two instruments:
      | exchangeBuyOne   | accountBuyOne   | exchangeSellOne   | accountSellOne   | exchangeBuyTwo   | accountBuyTwo   | exchangeSellTwo   | accountSellTwo   |
      | <ExchangeBuyOne> | <AccountBuyOne> | <ExchangeSellOne> | <AccountSellOne> | <ExchangeBuyTwo> | <AccountBuyTwo> | <ExchangeSellTwo> | <AccountSellTwo> |
    And user sets a random valid roles in the several instruments
    When user click "Add Task" button
    Then user sees the "Task has been added" success message

    Examples:
      | TaskType | ExchangeBuyOne | AccountBuyOne    | ExchangeSellOne | AccountSellOne  | ExchangeBuyTwo | AccountBuyTwo   | ExchangeSellTwo | AccountSellTwo |
      | BuySell  | BinanceSpot    | binanceSpot.e2e  | BybitSpot       | bybitSpot.e2e   | KucoinSpot     | kucoinSpot.e2e  | OkexSpot        | okexSpot.e2e   |
      | BuySell  | BinanceSwap    | binanceSwap.e2e  | OkexSwap        | okexSwap.e2e    | BybitSwap      | bybitSwap.e2e   | Deribit         | deribit.e2e    |
      | BuySell  | GateioSpot     | gateioSpot.e2e   | KrakenSpot      | krakenSpot.e2e  | KucoinSpot     | kucoinSpot.e2e  | OkexSpot        | okexSpot.e2e   |


  @clearIndexedDb
  Scenario Outline: "Herodotus" robot. Creating a new task type "<TaskType>" using exchanges buy "<ExchangeBuyOne>", "<ExchangeBuyTwo>" and sell "<ExchangeSellOne>"
    Given user goes on the "Trading Servers Manager" page with the selected "Add Task" tab in the "6017" robot
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user sets the "<TaskType>" task type
    And user sets random data in the "BuySell" task for two buy instruments and one sell instrument:
      | exchangeBuyOne   | accountBuyOne   | exchangeSellOne   | accountSellOne   | exchangeBuyTwo   | accountBuyTwo   |
      | <ExchangeBuyOne> | <AccountBuyOne> | <ExchangeSellOne> | <AccountSellOne> | <ExchangeBuyTwo> | <AccountBuyTwo> |
    And user sets a random valid roles in the several instruments
    When user click "Add Task" button
    Then user sees the "Task has been added" success message

    Examples:
      | TaskType | ExchangeBuyOne | AccountBuyOne    | ExchangeSellOne | AccountSellOne  | ExchangeBuyTwo | AccountBuyTwo   |
      | BuySell  | BinanceSpot    | binanceSpot.e2e  | BybitSpot       | bybitSpot.e2e   | KucoinSpot     | kucoinSpot.e2e  |
      | BuySell  | BinanceSwap    | binanceSwap.e2e  | OkexSwap        | okexSwap.e2e    | BybitSwap      | bybitSwap.e2e   |
      | BuySell  | GateioSpot     | gateioSpot.e2e   | KrakenSpot      | krakenSpot.e2e  | OkexSpot       | okexSpot.e2e    |


  @clearIndexedDb
  Scenario Outline: "Herodotus" robot. Creating a new task type "<TaskType>" using exchanges buy "<ExchangeBuyOne>" and sell "<ExchangeSellOne>", "<ExchangeSellTwo>"
    Given user goes on the "Trading Servers Manager" page with the selected "Add Task" tab in the "6017" robot
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user sets the "<TaskType>" task type
    And user sets random data in the "BuySell" task for one buy instruments and two sell instrument:
      | exchangeBuyOne   | accountBuyOne   | exchangeSellOne   | accountSellOne   | exchangeSellTwo   | accountSellTwo   |
      | <ExchangeBuyOne> | <AccountBuyOne> | <ExchangeSellOne> | <AccountSellOne> | <ExchangeSellTwo> | <AccountSellTwo> |
    And user sets a random valid roles in the several instruments
    When user click "Add Task" button
    Then user sees the "Task has been added" success message

    Examples:
      | TaskType | ExchangeBuyOne | AccountBuyOne    | ExchangeSellOne | AccountSellOne  | ExchangeSellTwo | AccountSellTwo  |
      | BuySell  | BinanceSpot    | binanceSpot.e2e  | BybitSpot       | bybitSpot.e2e   | KucoinSpot      | kucoinSpot.e2e  |
      | BuySell  | BinanceSwap    | binanceSwap.e2e  | OkexSwap        | okexSwap.e2e    | Deribit         | deribit.e2e     |
      | BuySell  | GateioSpot     | gateioSpot.e2e   | KrakenSpot      | krakenSpot.e2e  | OkexSpot        | okexSpot.e2e    |


  @clearIndexedDb
  Scenario: Archived and deleted new tasks
    Given user goes on the "Trading Servers Manager" page with the selected "Active Tasks" tab in the "6017" robot
    And user sees the "Authorization" page and logs in as a "Frontend" user
    When user archive active tasks
#    And user selects the "Archived Tasks" tab on the "Trading Servers Manager" page
#    Then user deletes all archive tasks

