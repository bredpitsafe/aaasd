Feature: e2e tests: "TSM" page test suit. I as User checks the functionality validation of "Add Task" tap of the "Herodotus" robot

  Background:
    Given user selects the "default" server

  @clearIndexedDb
  Scenario Outline: "Herodotus" robot. "Add Task" tab. Checking the visibility of the "<NameInput>" input error message
    Given user goes on the "Trading Servers Manager" page with the selected "Add Task" tab in the "1017" robot
    And user sees the "Authorization" page and logs in as a "Frontend" user
    When user selects task type values:
      | task           | baseAsset       | totalAmount      |
      | <TaskType>     | <BaseAssetType> | <AmountValue>    |
    And user waits for "5" seconds
    And user selects instruments values:
      | exchange       | account         | instrument       |
      | <ExchangeType> | <AccountType>   | <InstrumentType> |
    And user types price values:
      | orderAmount    | maxPrice        | aggression       |
      | <OrderAmount>  | <MaxPriceValue> | <AmountValue>    |
    And user not sees the "<ErrorMessage>" error message on the task form
    And user types the value of "0" in the "<NameInput>" input
    Then user sees the "<ErrorMessage>" error message on the task form

    Examples:
      | TaskType | BaseAssetType | AmountValue | ExchangeType | AccountType | InstrumentType | MaxPriceValue | OrderAmount | NameInput    | ErrorMessage                          |
      | Buy      | BTC           | 1           | BinanceSpot  | hero.bn     | BTCUSDC        | 5             | 1           | Total Amount | Amount should be greater then 0       |
      | Buy      | BTC           | 1           | BinanceSpot  | hero.bn     | BTCUSDC        | 5             | 1           | Order Amount | Order Amount should be greater then 0 |
      | Buy      | BTC           | 1           | BinanceSpot  | hero.bn     | BTCUSDC        | 5             | 1           | Max Price    | Max Price should be greater then 0    |


  @clearIndexedDb
  Scenario Outline: "Herodotus" robot. "Add Task" tab. Checking the visibility of the "Order Amount" input error message
    Given user goes on the "Trading Servers Manager" page with the selected "Add Task" tab in the "1017" robot
    And user sees the "Authorization" page and logs in as a "Frontend" user
    When user selects task type values:
      | task           | baseAsset       | totalAmount      |
      | <TaskType>     | <BaseAssetType> | <AmountValue>    |
    And user waits for "5" seconds
    And user selects instruments values:
      | exchange       | account         | instrument       |
      | <ExchangeType> | <AccountType>   | <InstrumentType> |
    And user types price values:
      | orderAmount    | maxPrice        | aggression       |
      | <OrderAmount>  | <MaxPriceValue> | <AmountValue>    |
    Then user sees the "<ErrorMessage>" error message on the task form
    And user types the value of "26300" in the "Order Amount" input
    And user not sees the "<ErrorMessage>" error message on the task form

    Examples:
      | TaskType | BaseAssetType | AmountValue | ExchangeType    | AccountType  | InstrumentType | MaxPriceValue | OrderAmount |  ErrorMessage                                                 |
      | Buy      | USD           | 1           | BinanceCoinSwap | bncs.hero    | BTCUSD_PERP    | 5             | 26350       |   Order Amount is not a multiple of the amount step: 100 USDT |

