Feature: e2e tests: "TSM" page test suit. I as User checks the functionality validation of "Add Task" tap of the "Herodotus" robot

  Background:
    Given user selects the "default" server

  @clearIndexedDb
  Scenario Outline: "Herodotus" robot. "Add Task" tab. Check the visibility of the "Order Amount" label
    Given user goes on the "Trading Servers Manager" page with the selected "Add Task" tab in the "1017" robot
    And user sees the "Authorization" page and logs in as a "Frontend" user
    When user selects task type values:
      | task       | baseAsset      | totalAmount   |
      | <TaskType> | <BaseAssetOne> | <AmountValue> |
    When user sees the "<BaseAssetOne>" label in the "Order Amount" input
    And user selects "<BaseAssetTwo>" from the "Base Asset" selector
    When user sees the "<BaseAssetTwo>" label in the "Order Amount" input
    And user selects "<BaseAssetThree>" from the "Base Asset" selector
    Then user sees the "<BaseAssetThree>" label in the "Order Amount" input

    Examples:
      | TaskType | AmountValue | BaseAssetOne | BaseAssetTwo | BaseAssetThree |
      | Sell     | 0.01        | ETH          | ADA          | DAI            |


  @clearIndexedDb
  Scenario Outline: "Herodotus" robot. "Add Task" tab. Check the visibility of the "Total Amount" label
    Given user goes on the "Trading Servers Manager" page with the selected "Add Task" tab in the "1017" robot
    And user sees the "Authorization" page and logs in as a "Frontend" user
    When user selects task type values:
      | task       | baseAsset      | totalAmount   |
      | <TaskType> | <BaseAssetOne> | <AmountValue> |
    When user sees the "<BaseAssetOne>" label in the "Total Amount" input
    And user selects "<BaseAssetTwo>" from the "Base Asset" selector
    When user sees the "<BaseAssetTwo>" label in the "Total Amount" input
    And user selects "<BaseAssetThree>" from the "Base Asset" selector
    When user sees the "<BaseAssetThree>" label in the "Total Amount" input

    Examples:
      | TaskType | AmountValue | BaseAssetOne | BaseAssetTwo | BaseAssetThree |
      | Buy      | 0.01        | BTC          | BAL          | ACM            |


  @clearIndexedDb
  Scenario Outline: "Herodotus" robot. "Add Task" tab. Checking selecting of the "Currency Type" selector
    Given user goes on the "Trading Servers Manager" page with the selected "Add Task" tab in the "1017" robot
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user selects task type values:
      | task          | baseAsset       | totalAmount      |
      | <TaskType>    | <BaseAssetType> | <AmountValue>    |
    And user waits for "5" seconds
    And user selects instruments values:
      | exchange       | account        | instrument       |
      | <ExchangeType> | <AccountType>  | <InstrumentType> |
    And user types price values:
      | orderAmount    | maxPrice       | aggression       |
      | <AmountValue>  | <MaxPriceValue>| <AmountValue>    |
    When user selects value "<CurrencyTypeOne>" in the "Currency Type" input
    And user sees the "<LabelOne>" label in the "<NameLabel>" input
    When user selects value "<CurrencyTypeTwo>" in the "Currency Type" input
    Then user sees the "<LabelTwo>" label in the "<NameLabel>" input

    Examples:
      | TaskType | BaseAssetType | AmountValue | ExchangeType | AccountType | InstrumentType | MaxPriceValue | CurrencyTypeOne | CurrencyTypeTwo | LabelOne | LabelTwo | NameLabel |
      | Sell     | ETH           | 1           | BinanceSpot  | hero.bn     | ETHBTC         | 50            | Quote           | Reference       | BTC      | USDT     | Min Price |
      | Buy      | BTC           | 15          | BinanceSpot  | hero.bn     | BTCDAI         | 50            | Reference       | Quote           | USDT     | DAI      | Max Price |


  @clearIndexedDb
  Scenario Outline: "Herodotus" robot. "Add Task" tab. Checking the function of the "Reset" button
    Given user goes on the "Trading Servers Manager" page with the selected "Add Task" tab in the "1017" robot
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user selects task type values:
      | task           | baseAsset        | totalAmount      |
      | <TaskType>     | <BaseAssetType>  | <AmountValue>    |
    And user waits for "5" seconds
    And user selects instruments values:
      | exchange       | account          | instrument       |
      | <ExchangeType> | <AccountType>    | <InstrumentType> |
    And user types price values:
      | orderAmount    | maxPrice         | aggression       |
      | <AmountValue>  | <MaxPriceValue>  | <AmountValue>    |
    When user click "Reset Form" button
    Then user not sees a set value in the "Add Task" form
      | baseAsset        | totalAmount      | exchange       | account          | instrument       | maxPrice         |
      | <BaseAssetType>  | <AmountValue>    | <ExchangeType> | <AccountType>    | <InstrumentType> | <MaxPriceValue>  |


    Examples:
      | TaskType | BaseAssetType | AmountValue | ExchangeType | AccountType | InstrumentType | MaxPriceValue |
      | Buy      | BTC           | 8           | BinanceSpot  | hero.bn     | BTCUSDT        | 2             |