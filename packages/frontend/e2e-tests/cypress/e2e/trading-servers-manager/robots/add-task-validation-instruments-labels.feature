Feature: e2e tests: "TSM" page test suit. I as User checks the functionality validation of "Add Task" tap of the "Herodotus" robot

  Background:
    Given user selects the "default" server

  @clearIndexedDb
  Scenario Outline: "Herodotus" robot. "Add Task" tab. Check the visibility of the "Instruments" labels
    Given user goes on the "Trading Servers Manager" page with the selected "Add Task" tab in the "1017" robot
    And user sees the "Authorization" page and logs in as a "Frontend" user
    When user selects task type values:
      | task             | baseAsset       | totalAmount      |
      | <TaskType>       | <BaseAssetType> | <AmountValue>    |
    And user waits for "5" seconds
    And user selects instruments values:
      | exchange         | account         | instrument       |
      | <ExchangeType>   | <AccountType>   | <InstrumentType> |
    And user types price values:
      | orderAmount      | maxPrice        | aggression       |
      | <OrderAmountOne> | <MaxPriceValue> | <AmountValue>    |
    Then user sees labels in the "Instruments" form
    And user sees value "1 ETH" in the "Order Amount" label
    And user sees value "1 = 1 ETH" in the "Amount Multiplier" label
    And user sees value "0.2 ETH" in the "Max Order Amount" label
    And user sees value "0.0001 ETH" in the "Amount Step" label
    And user types the value of "<OrderAmountTwo>" in the "Order Amount" input
    And user sees value "0.002 ETH" in the "Order Amount" label
    And user sees value "1 = 1 ETH" in the "Amount Multiplier" label
    And user sees value "0.2 ETH" in the "Max Order Amount" label
    And user sees value "0.0001 ETH" in the "Amount Step" label
    And user types the value of "<OrderAmountThree>" in the "Order Amount" input
    And user sees value "1250 ETH" in the "Order Amount" label
    And user sees value "1 = 1 ETH" in the "Amount Multiplier" label
    And user sees value "0.2 ETH" in the "Max Order Amount" label
    And user sees value "0.0001 ETH" in the "Amount Step" label

    Examples:
      | TaskType | BaseAssetType | AmountValue | ExchangeType | AccountType | InstrumentType | MaxPriceValue | OrderAmountOne | OrderAmountTwo | OrderAmountThree |
      | Sell     | ETH           | 1           | BinanceSpot  | hero.bn     | ETHBTC         | 12            | 1              | 0.002          | 1250             |


  @clearIndexedDb
  Scenario Outline: "Herodotus" robot. "Add Task" tab. Check the visibility of the "Instruments" labels
    Given user goes on the "Trading Servers Manager" page with the selected "Add Task" tab in the "1017" robot
    And user sees the "Authorization" page and logs in as a "Frontend" user
    When user selects task type values:
      | task             | baseAsset       | totalAmount      |
      | <TaskType>       | <BaseAssetType> | <AmountValue>    |
    And user waits for "5" seconds
    And user selects instruments values:
      | exchange         | account         | instrument       |
      | <ExchangeType>   | <AccountType>   | <InstrumentType> |
    And user types price values:
      | orderAmount      | maxPrice        | aggression       |
      | <OrderAmountOne> | <MaxPriceValue> | <AmountValue>    |
    Then user sees labels in the "Instruments" form
    And user sees value "2 ADA" in the "Order Amount" label
    And user sees value "1 = 1 ADA" in the "Amount Multiplier" label
    And user sees value "10000 ADA" in the "Max Order Amount" label
    And user sees value "0.1 ADA" in the "Amount Step" label
    And user types the value of "<OrderAmountTwo>" in the "Order Amount" input
    And user sees value "0.1 ADA" in the "Order Amount" label
    And user sees value "1 = 1 ADA" in the "Amount Multiplier" label
    And user sees value "10000 ADA" in the "Max Order Amount" label
    And user sees value "0.1 ADA" in the "Amount Step" label
    And user types the value of "<OrderAmountThree>" in the "Order Amount" input
    And user sees value "26350 ADA" in the "Order Amount" label
    And user sees value "1 = 1 ADA" in the "Amount Multiplier" label
    And user sees value "10000 ADA" in the "Max Order Amount" label
    And user sees value "0.1 ADA" in the "Amount Step" label

    Examples:
      | TaskType | BaseAssetType | AmountValue | ExchangeType | AccountType | InstrumentType | MaxPriceValue | OrderAmountOne | OrderAmountTwo | OrderAmountThree |
      | Buy      | ADA           | 1           | BinanceSpot  | hero.bn     | ADAUSDT        | 12            | 2              | 0.1            | 26350            |


  @clearIndexedDb
  Scenario Outline: "Herodotus" robot. "Add Task" tab. Check the visibility of the "Instruments" labels
    Given user goes on the "Trading Servers Manager" page with the selected "Add Task" tab in the "1017" robot
    And user sees the "Authorization" page and logs in as a "Frontend" user
    When user selects task type values:
      | task             | baseAsset       | totalAmount      |
      | <TaskType>       | <BaseAssetType> | <AmountValue>    |
    And user waits for "5" seconds
    And user selects instruments values:
      | exchange         | account         | instrument       |
      | <ExchangeType>   | <AccountType>   | <InstrumentType> |
    And user types price values:
      | orderAmount      | maxPrice        | aggression       |
      | <OrderAmountOne> | <MaxPriceValue> | <AmountValue>    |
    Then user sees labels in the "Instruments" form
    And user sees value "1 Lots (100 USD)" in the "Order Amount" label
    And user sees value "1 = 100 USD" in the "Amount Multiplier" label
    And user sees value "1000 Lots (100000 USD)" in the "Max Order Amount" label
    And user sees value "100 USD" in the "Amount Step" label
    And user types the value of "<OrderAmountTwo>" in the "Order Amount" input
    And user sees value "2 Lots (200 USD)" in the "Order Amount" label
    And user sees value "1 = 100 USD" in the "Amount Multiplier" label
    And user sees value "1000 Lots (100000 USD)" in the "Max Order Amount" label
    And user sees value "100 USD" in the "Amount Step" label
    And user types the value of "<OrderAmountThree>" in the "Order Amount" input
    And user sees value "263 Lots (26300 USD)" in the "Order Amount" label
    And user sees value "1 = 100 USD" in the "Amount Multiplier" label
    And user sees value "1000 Lots (100000 USD)" in the "Max Order Amount" label
    And user sees value "100 USD" in the "Amount Step" label

    Examples:
      | TaskType | BaseAssetType | AmountValue | ExchangeType    | AccountType  | InstrumentType     | MaxPriceValue | OrderAmountOne | OrderAmountTwo | OrderAmountThree |
      | Buy      | USD           | 1           | BinanceCoinSwap | bncs.hero    | BTCUSD_PERP        | 12            | 100            | 200            | 26300            |


  @clearIndexedDb
  Scenario Outline: "Herodotus" robot. "Add Task" tab. Check the visibility of the "Balance" labels
    Given user goes on the "Trading Servers Manager" page with the selected "Add Task" tab in the "1017" robot
    And user sees the "Authorization" page and logs in as a "Frontend" user
    When user selects task type values:
      | task             | baseAsset       | totalAmount      |
      | <TaskType>       | <BaseAssetType> | <AmountValue>    |
    And user waits for "5" seconds
    And user selects instruments values:
      | exchange         | account         | instrument       |
      | <ExchangeType>   | <AccountType>   | <InstrumentType> |
    And user types price values:
      | orderAmount      | maxPrice        | aggression       |
      | <OrderAmountOne> | <MaxPriceValue> | <AmountValue>    |
    Then user sees labels in the "Instruments" form
    And user sees value "1 BTC" in the "Order Amount" label
    And user sees value "1 = 1 BTC" in the "Amount Multiplier" label
    And user sees value "0.05 BTC" in the "Max Order Amount" label
    And user sees value "0.00001 BTC" in the "Amount Step" label
    And user sees value "0 USDC" in the "Balance" label
    And user sees value "0 USDT" in the "Reference balance" label

    Examples:
      | TaskType | BaseAssetType | AmountValue | ExchangeType | AccountType | InstrumentType | MaxPriceValue | OrderAmountOne |
      | Buy      | BTC           | 1           | BinanceSpot  | hero.bn     | BTCUSDC        | 12            | 1              |


  @clearIndexedDb
  Scenario Outline: "Herodotus" robot. "Add Task" tab. Check the visibility of the "Position" labels
    Given user goes on the "Trading Servers Manager" page with the selected "Add Task" tab in the "1017" robot
    And user sees the "Authorization" page and logs in as a "Frontend" user
    When user selects task type values:
      | task             | baseAsset       | totalAmount      |
      | <TaskType>       | <BaseAssetType> | <AmountValue>    |
    And user waits for "5" seconds
    And user selects instruments values:
      | exchange         | account         | instrument       |
      | <ExchangeType>   | <AccountType>   | <InstrumentType> |
    And user types price values:
      | orderAmount      | maxPrice        | aggression       |
      | <OrderAmountOne> | <MaxPriceValue> | <AmountValue>    |
    Then user sees labels in the "Instruments" form
    And user sees value "4 BTC" in the "Order Amount" label
    And user sees value "1 = 1 BTC" in the "Amount Multiplier" label
    And user sees value "0.002 BTC" in the "Max Order Amount" label
    And user sees value "0.001 BTC" in the "Amount Step" label
    And user sees value "1132543.241" in the "Position" label

    Examples:
      | TaskType | BaseAssetType | AmountValue | ExchangeType | AccountType   | InstrumentType     | MaxPriceValue | OrderAmountOne |
      | Buy      | BTC           | 12          | Deribit      | deribit.hero  | BTC_USDC-PERPETUAL | 12            | 4              |


  @clearIndexedDb
  Scenario Outline: Checking the visibility of the convertrade value
    Given user goes on the "Trading Servers Manager" page with the selected "Add Task" tab in the "1017" robot
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user selects task type values:
      | task           | baseAsset        | totalAmount      |
      | <TaskType>     | <BaseAssetType>  | <Value>          |
    And user waits for "5" seconds
    And user selects instruments values:
      | exchange       | account          | instrument       |
      | <ExchangeType> | <AccountType>    | <InstrumentType> |
    And user types price values:
      | orderAmount    | maxPrice         | aggression       |
      | <Value>        | <MaxPriceValue>  | <Value>          |
    Then user sees convert value in the "Add Task" tab

    Examples:
      | TaskType | BaseAssetType | Value | ExchangeType | AccountType  | InstrumentType | MaxPriceValue |
      | Buy      | BTC           | 8     | BinanceSpot  | hero.bn      | BTCUSDT        | 2             |


  @clearIndexedDb
  Scenario Outline: Checking the setting and resetting of the "Max Price" value for the "<BaseAssetType>" BaseAsset
    Given user goes on the "Trading Servers Manager" page with the selected "Add Task" tab in the "1017" robot
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user selects task type values:
      | task           | baseAsset        | totalAmount      |
      | <TaskType>     | <BaseAssetType>  | <Value>          |
    And user sees convert value in the "Add Task" tab
    When user sees "Max Price" value in the "Max Price" input
    And user clears "Max Price" value and sees a "Reset price to current" Button
    And user sees the "Max Price is required" error message on the task form
    And user clicks on the "Reset price to current" button in the "Add Task" form
    Then user sees "Max Price" value in the "Max Price" input

    Examples:
      | TaskType | BaseAssetType | Value |
      | Buy      | BTC           | 10    |

