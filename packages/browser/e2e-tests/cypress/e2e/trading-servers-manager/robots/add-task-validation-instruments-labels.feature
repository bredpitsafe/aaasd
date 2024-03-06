Feature: e2e tests: "TSM" page test suit. I as User checks the functionality validation of "Add Task" tap of the "Herodotus" robot

  Background:
    Given user selects the "default" server

  @clearIndexedDb
  Scenario Outline: "Herodotus" robot. "Add Task" tab. Check the visibility of the "Instruments" labels
    Given user goes on the "Trading Servers Manager" page with the selected "HerodotusMulti" in the "Robots" table
    And user selects the "Add Task" tab
    When user selects task type values:
      | task             | baseAsset       | totalAmount      |
      | <TaskType>       | <BaseAssetType> | <AmountValue>    |
    And user selects instruments values:
      | exchange         | account         | instrument       |
      | <ExchangeType>   | <AccountType>   | <InstrumentType> |
    And user types price values:
      | orderAmount      | maxPrice        | aggression       |
      | <OrderAmountOne> | <MaxPriceValue> | <AmountValue>    |
    Then user sees labels in the "Instruments" form
    And user sees value "1 ETH" in the "Order Amount Value" label
    And user sees value "1 ETH" in the "Amount Multiplier" label
    And user sees value "0.2 ETH" in the "Max Order Amount" label
    And user sees value "0.0001 ETH" in the "Amount Step" label
    And user types the value of "<OrderAmountTwo>" in the "Order Amount" input
    And user sees value "0.002 ETH" in the "Order Amount Value" label
    And user sees value "1 ETH" in the "Amount Multiplier" label
    And user sees value "0.2 ETH" in the "Max Order Amount" label
    And user sees value "0.0001 ETH" in the "Amount Step" label
    And user types the value of "<OrderAmountThree>" in the "Order Amount" input
    And user sees value "1250 ETH" in the "Order Amount Value" label
    And user sees value "1 ETH" in the "Amount Multiplier" label
    And user sees value "0.2 ETH" in the "Max Order Amount" label
    And user sees value "0.0001 ETH" in the "Amount Step" label

    Examples:
      | TaskType | BaseAssetType | AmountValue | ExchangeType | AccountType | InstrumentType | MaxPriceValue | OrderAmountOne | OrderAmountTwo | OrderAmountThree |
      | Sell     | ETH           | 1           | BinanceSpot  | hero.bn     | ETHBTC         | 12            | 1              | 0.002          | 1250             |


  @clearIndexedDb
  Scenario Outline: "Herodotus" robot. "Add Task" tab. Check the visibility of the "Instruments" labels
    Given user goes on the "Trading Servers Manager" page with the selected "HerodotusMulti" in the "Robots" table
    And user selects the "Add Task" tab
    When user selects task type values:
      | task             | baseAsset       | totalAmount      |
      | <TaskType>       | <BaseAssetType> | <AmountValue>    |
    And user selects instruments values:
      | exchange         | account         | instrument       |
      | <ExchangeType>   | <AccountType>   | <InstrumentType> |
    And user types price values:
      | orderAmount      | maxPrice        | aggression       |
      | <OrderAmountOne> | <MaxPriceValue> | <AmountValue>    |
    Then user sees labels in the "Instruments" form
    And user sees value "2 ADA" in the "Order Amount Value" label
    And user sees value "1 ADA" in the "Amount Multiplier" label
    And user sees value "10000 ADA" in the "Max Order Amount" label
    And user sees value "0.1 ADA" in the "Amount Step" label
    And user types the value of "<OrderAmountTwo>" in the "Order Amount" input
    And user sees value "0.1 ADA" in the "Order Amount Value" label
    And user sees value "1 ADA" in the "Amount Multiplier" label
    And user sees value "10000 ADA" in the "Max Order Amount" label
    And user sees value "0.1 ADA" in the "Amount Step" label
    And user types the value of "<OrderAmountThree>" in the "Order Amount" input
    And user sees value "26350 ADA" in the "Order Amount Value" label
    And user sees value "1 ADA" in the "Amount Multiplier" label
    And user sees value "10000 ADA" in the "Max Order Amount" label
    And user sees value "0.1 ADA" in the "Amount Step" label

    Examples:
      | TaskType | BaseAssetType | AmountValue | ExchangeType | AccountType | InstrumentType | MaxPriceValue | OrderAmountOne | OrderAmountTwo | OrderAmountThree |
      | Buy      | ADA           | 1           | BinanceSpot  | hero.bn     | ADAUSDT        | 12            | 2              | 0.1            | 26350            |


  @clearIndexedDb
  Scenario Outline: "Herodotus" robot. "Add Task" tab. Check the visibility of the "Instruments" labels
    Given user goes on the "Trading Servers Manager" page with the selected "HerodotusMulti" in the "Robots" table
    And user selects the "Add Task" tab
    And user selects "USDC" asset
    When user selects task type values:
      | task             | baseAsset       | totalAmount      |
      | <TaskType>       | <BaseAssetType> | <AmountValue>    |
    And user selects instruments values:
      | exchange         | account         | instrument       |
      | <ExchangeType>   | <AccountType>   | <InstrumentType> |
    And user types price values:
      | orderAmount      | maxPrice        | aggression       |
      | <OrderAmountOne> | <MaxPriceValue> | <AmountValue>    |
    Then user sees labels in the "Instruments" form
    And user sees value "1 Lots (100 USD)" in the "Order Amount Value" label
    And user sees value "100 USD" in the "Amount Multiplier" label
    And user sees value "1000 Lots (100000 USD)" in the "Max Order Amount" label
    And user sees value "100 USD" in the "Amount Step" label
    And user types the value of "<OrderAmountTwo>" in the "Order Amount" input
    And user sees value "2 Lots (200 USD)" in the "Order Amount Value" label
    And user sees value "100 USD" in the "Amount Multiplier" label
    And user sees value "1000 Lots (100000 USD)" in the "Max Order Amount" label
    And user sees value "100 USD" in the "Amount Step" label
    And user types the value of "<OrderAmountThree>" in the "Order Amount" input
    And user sees value "263 Lots (26300 USD)" in the "Order Amount Value" label
    And user sees value "100 USD" in the "Amount Multiplier" label
    And user sees value "1000 Lots (100000 USD)" in the "Max Order Amount" label
    And user sees value "100 USD" in the "Amount Step" label

    Examples:
      | TaskType | BaseAssetType | AmountValue | ExchangeType    | AccountType  | InstrumentType     | MaxPriceValue | OrderAmountOne | OrderAmountTwo | OrderAmountThree |
      | Buy      | USD           | 1           | BinanceCoinSwap | bncs.hero    | BTCUSD_PERP        | 12            | 100            | 200            | 26300            |

