Feature: e2e tests: "TSM" page test suit. I as User checks the functionality validation of "Add Task" tap of the "Herodotus" robot

  Background:
    Given user selects the "default" server

  @clearIndexedDb
  Scenario Outline: "Herodotus" robot. "Add Task" tab. Check the visibility of the "Order Amount" label
    Given user goes on the "Trading Servers Manager" page with the selected "HerodotusMulti" in the "Robots" table
    And user selects the "Add Task" tab
    When user selects task type values:
      | task       | baseAsset      | totalAmount   |
      | <TaskType> | <BaseAssetOne> | <AmountValue> |
    Then user sees value "<BaseAssetOne>" in the "Order Amount" label
    And user selects "<BaseAssetTwo>" from the "Base Asset" selector
    And user sees value "<BaseAssetTwo>" in the "Order Amount" label
    And user selects "<BaseAssetThree>" from the "Base Asset" selector
    And user sees value "<BaseAssetThree>" in the "Order Amount" label

    Examples:
      | TaskType | AmountValue | BaseAssetOne | BaseAssetTwo | BaseAssetThree |
      | Sell     | 0.01        | ADA          | DAI          | ETH            |


  @clearIndexedDb
  Scenario Outline: "Herodotus" robot. "Add Task" tab. Check the visibility of the "Total Amount" label
    Given user goes on the "Trading Servers Manager" page with the selected "HerodotusMulti" in the "Robots" table
    And user selects the "Add Task" tab
    When user selects task type values:
      | task       | baseAsset      | totalAmount   |
      | <TaskType> | <BaseAssetOne> | <AmountValue> |
    And user sees value "<BaseAssetOne>" in the "Total Amount" label
    And user selects "<BaseAssetTwo>" from the "Base Asset" selector
    And user sees value "<BaseAssetTwo>" in the "Total Amount" label
    And user selects "<BaseAssetThree>" from the "Base Asset" selector
    And user sees value "<BaseAssetThree>" in the "Total Amount" label

    Examples:
      | TaskType | AmountValue | BaseAssetOne | BaseAssetTwo | BaseAssetThree |
      | Buy      | 0.01        | BTC          | BAL          | ACM            |


  @clearIndexedDb
  Scenario Outline: "Herodotus" robot. "Add Task" tab. Checking selecting of the "Currency Type" selector
    Given user goes on the "Trading Servers Manager" page with the selected "HerodotusMulti" in the "Robots" table
    And user selects the "Add Task" tab
    And user selects task type values:
      | task          | baseAsset       | totalAmount      |
      | <TaskType>    | <BaseAssetType> | <AmountValue>    |
    And user selects instruments values:
      | exchange       | account        | instrument       |
      | <ExchangeType> | <AccountType>  | <InstrumentType> |
    And user types price values:
      | orderAmount    | maxPrice       | aggression       |
      | <AmountValue>  | <MaxPriceValue>| <AmountValue>    |
    When user selects value "<CurrencyTypeOne>" in the "Currency Type" input
    Then user sees value "<LabelOne>" in the "Min Price" label
    And user selects value "<CurrencyTypeTwo>" in the "Currency Type" input
    And user sees value "<LabelTwo>" in the "Min Price" label

    Examples:
      | TaskType | BaseAssetType | AmountValue | ExchangeType | AccountType | InstrumentType | MaxPriceValue | CurrencyTypeOne | CurrencyTypeTwo | LabelOne | LabelTwo |
      | Sell     | ETH           | 1           | BinanceSpot  | hero.bn     | ETHBTC         | 50            | Quote           | Reference       | BTC      | USDT     |
      | Buy      | BTC           | 15          | BinanceSpot  | hero.bn     | BTCDAI         | 50            | Reference       | Quote           | USDT     | DAI      |


  @clearIndexedDb
  Scenario Outline: "Herodotus" robot. "Add Task" tab. Checking the function of the "Reset" button
    Given user goes on the "Trading Servers Manager" page with the selected "HerodotusMulti" in the "Robots" table
    And user selects the "Add Task" tab
    And user selects task type values:
      | task           | baseAsset        | totalAmount      |
      | <TaskType>     | <BaseAssetType>  | <AmountValue>    |
    And user selects instruments values:
      | exchange       | account          | instrument       |
      | <ExchangeType> | <AccountType>    | <InstrumentType> |
    And user types price values:
      | orderAmount    | maxPrice         | aggression       |
      | <AmountValue>  | <MaxPriceValue>  | <AmountValue>    |
    When user click "Reset Form" button
    And user not sees a set value in the "Add Task" form
      | baseAsset        | totalAmount      | exchange       | account          | instrument       | maxPrice         |
      | <BaseAssetType>  | <AmountValue>    | <ExchangeType> | <AccountType>    | <InstrumentType> | <MaxPriceValue>  |


    Examples:
      | TaskType | BaseAssetType | AmountValue | ExchangeType | AccountType | InstrumentType | MaxPriceValue |
      | Buy      | BTC           | 8           | BinanceSpot  | hero.bn     | BTCUSDT        | 2             |