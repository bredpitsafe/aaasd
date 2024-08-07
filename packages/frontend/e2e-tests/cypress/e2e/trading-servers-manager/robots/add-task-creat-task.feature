Feature: e2e tests: "TSM" page test suit. I as User checks the functionality of "Add Task" tab of the "Herodotus" robot

  Background:
    Given user selects the "default" server

  @clearIndexedDb
  Scenario Outline: "Herodotus" robot. "Add Task" tab. Checking the addition of a task with "<TaskType>" TaskType
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
    When user click "Add Task" button
    Then user sees the "Task has been added" success message

    Examples:
      | TaskType | BaseAssetType | AmountValue | ExchangeType | AccountType | InstrumentType | MaxPriceValue |
      | Buy      | BTC           | 8           | BinanceSpot  | hero.bn     | BTCUSDT        | 2             |


  @clearIndexedDb
  Scenario Outline: "Herodotus" robot. "Add Task" tab. Checking the addition of a task with "<TaskType>" TaskType and two instruments
    Given user goes on the "Trading Servers Manager" page with the selected "Add Task" tab in the "1017" robot
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user selects task type values:
      | task           | baseAsset       | totalAmount         |
      | <TaskType>     | <BaseAssetType> | <AmountValue>       |
    And user waits for "5" seconds
    And user selects instruments values:
      | exchange       | account         | instrument          |
      | <ExchangeType> | <AccountType>   | <InstrumentTypeOne> |
    And user clicks on the "Add" button and adds a new instruments
    And user waits for "5" seconds
    And user selects second instruments values:
      | exchange       | account         | instrument          |
      | <ExchangeType> | <AccountType>   | <InstrumentTypeTwo> |
    And user types price values:
      | orderAmount    | maxPrice        | aggression          |
      | <AmountValue>  | <MaxPriceValue> | <AmountValue>       |
    When user click "Add Task" button
    Then user sees the "Task has been added" success message

    Examples:
      | TaskType | BaseAssetType | AmountValue | ExchangeType | AccountType | InstrumentTypeOne | InstrumentTypeTwo | MaxPriceValue |
      | Buy      | ETH           | 10          | BinanceSpot  | hero.bn     | ETHUSDC           | ETHUSDT           | 1             |


  @clearIndexedDb
  Scenario Outline: "Herodotus" robot. "Add Task" tab. Checking the addition of a task with "<TaskType>" TaskType
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
    When user click "Add Task" button
    Then user sees the "Task has been added" success message

    Examples:
      | TaskType | BaseAssetType | AmountValue | ExchangeType | AccountType | InstrumentType | MaxPriceValue |
      | Sell     | ETH           | 1           | BinanceSpot  | hero.bn     | ETHBTC         | 50            |


  @clearIndexedDb
  Scenario Outline: "Herodotus" robot. "Add Task" tab. Checking the addition of a task with "<TaskType>" TaskType and two instruments
    Given user goes on the "Trading Servers Manager" page with the selected "Add Task" tab in the "1017" robot
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user selects task type values:
      | task           | baseAsset       | totalAmount         |
      | <TaskType>     | <BaseAssetType> | <AmountValue>       |
    And user waits for "5" seconds
    And user selects instruments values:
      | exchange       | account         | instrument          |
      | <ExchangeType> | <AccountType>   | <InstrumentTypeOne> |
    And user clicks on the "Add" button and adds a new instruments
    And user waits for "5" seconds
    And user selects second instruments values:
      | exchange       | account         | instrument          |
      | <ExchangeType> | <AccountType>   | <InstrumentTypeTwo> |
    And user types price values:
      | orderAmount    | maxPrice        | aggression          |
      | <AmountValue>  | <MaxPriceValue> | <AmountValue>       |
    When user click "Add Task" button
    Then user sees the "Task has been added" success message

    Examples:
      | TaskType | BaseAssetType | AmountValue | ExchangeType | AccountType | InstrumentTypeOne | InstrumentTypeTwo | MaxPriceValue |
      | Sell     | BTC           | 10          | BinanceSpot  | hero.bn     | BTCUSDT           | BTCUSDC           | 1             |


  @clearIndexedDb
  Scenario Outline: "Herodotus" robot. "Add Task" tab. Checking the addition of a task with "<TaskType>" TaskType
    Given user goes on the "Trading Servers Manager" page with the selected "Add Task" tab in the "1017" robot
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user selects task type values:
      | task            | baseAsset          | totalAmount         |
      | <TaskType>      | <BaseAssetType>    | <AmountValue>       |
    And user waits for "5" seconds
    And user selects "Buy" instruments values:
      | exchange        | account           | instrument           |
      | <ExchangeType>  | <AccountType>     | <InstrumentTypeBuy>  |
    And user waits for "5" seconds
    And user selects "Sell" instruments values:
      | exchange        | account           | instrument           | role           |
      | <ExchangeType>  | <AccountType>     | <InstrumentTypeSell> | <RoleTypeSell> |
    And user types premium values:
      | orderAmount     | maxPremium        | aggression           |
      | <AmountValue>   | <MaxPremiumValue> | <AmountValue>        |
    When user click "Add Task" button
    Then user sees the "Task has been added" success message

    Examples:
      | TaskType | BaseAssetType | AmountValue | ExchangeType | AccountType | InstrumentTypeBuy | InstrumentTypeSell | RoleTypeSell | MaxPremiumValue |
      | BuySell  | BTC           | 10          | BinanceSpot  | hero.bn     | BTCUSDT           | BTCUSDC            | Hedge        | 5               |


  @clearIndexedDb
  Scenario Outline: "Herodotus" robot. "Add Task" tab. Checking the addition of a task with "<TaskType>" TaskType and two instruments
    Given user goes on the "Trading Servers Manager" page with the selected "Add Task" tab in the "1017" robot
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user selects task type values:
      | task           | baseAsset         | totalAmount            |
      | <TaskType>     | <BaseAssetType>   | <AmountValue>          |
    And user waits for "5" seconds
    And user selects "Buy" instruments values:
      | exchange       | account           | instrument             |
      | <ExchangeType> | <AccountType>     | <InstrumentTypeBuy>    |
    And user waits for "5" seconds
    And user selects "Sell" instruments values:
      | exchange          | account           | instrument             | role           |
      | <ExchangeTypeTwo> | <AccountTypeTwo>  | <InstrumentTypeSell>   | <RoleTypeSell> |
    And clicks on the "Add" button for the "Buy" instrument and the "Sell" instrument
    And user waits for "5" seconds
    And user selects "Buy" instruments values:
      | exchange       | account           | instrument             |
      | <ExchangeType> | <AccountType>     | <InstrumentTypeBuyTwo> |
    And user waits for "5" seconds
    And user selects "Sell" instruments values:
      | exchange          | account           | instrument             | role           |
      | <ExchangeTypeTwo> | <AccountTypeTwo>  | <InstrumentTypeSellTwo>| <RoleTypeSell> |
    And user types premium values:
      | orderAmount    | maxPremium        | aggression             |
      | <AmountValue>  | <MaxPremiumValue> | <AmountValue>          |
    When user click "Add Task" button
    Then user sees the "Task has been added" success message

    Examples:
      | TaskType | BaseAssetType | AmountValue | ExchangeType | ExchangeTypeTwo | AccountType | AccountTypeTwo | InstrumentTypeBuy | InstrumentTypeBuyTwo | InstrumentTypeSell | InstrumentTypeSellTwo | RoleTypeSell | MaxPremiumValue |
      | BuySell  | BTC           | 10          | BinanceSpot  | Deribit         | hero.bn     | deribit.hero   | BTCUSDC           | BTCUSDT              | BTC_USDC-PERPETUAL | BTC_USDT-PERPETUAL    | Hedge        | 5               |


  @clearIndexedDb
  Scenario Outline: "Herodotus" robot. "Add Task" tab. Checking the creation of several tasks with different tools
    Given user goes on the "Trading Servers Manager" page with the selected "Add Task" tab in the "1017" robot
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user waits for "5" seconds
    And user sets the task data:
      | baseAsset          | totalAmount   | exchange       | account       | instrument          | orderAmount   | maxPrice        | aggression     |
      | <BaseAssetTypeOne> | <AmountValue> | <ExchangeType> | <AccountType> | <InstrumentTypeOne> | <AmountValue> | <MaxPriceValue> | <AmountValue>  |
    When user click "Add Task" button
    And user sees the "Task has been added" success message
    And user sets the task data:
      | baseAsset          | totalAmount   | exchange       | account       | instrument          | orderAmount   | maxPrice        | aggression     |
      | <BaseAssetTypeTwo> | <AmountValue> | <ExchangeType> | <AccountType> | <InstrumentTypeTwo> | <AmountValue> | <MaxPriceValue> | <AmountValue>  |
    When user click "Add Task" button
    And user sees the "Task has been added" success message
    And user click "Reset Form" button
    And user sets the task data:
      | baseAsset            | totalAmount   | exchange       | account       | instrument            | orderAmount   | maxPrice        | aggression     |
      | <BaseAssetTypeThree> | <AmountValue> | <ExchangeType> | <AccountType> | <InstrumentTypeThree> | <AmountValue> | <MaxPriceValue> | <AmountValue>  |
    When user click "Add Task" button
    Then user sees the "Task has been added" success message

    Examples:
      | BaseAssetTypeOne | BaseAssetTypeTwo | BaseAssetTypeThree | AmountValue | ExchangeType | AccountType | InstrumentTypeOne | InstrumentTypeTwo | InstrumentTypeThree | MaxPriceValue |
      | ETH              | ADA              | BTC                | 8           | BinanceSpot  | hero.bn     | ETHBTC            | ADAUSDT           | BTCUSDT             | 2             |