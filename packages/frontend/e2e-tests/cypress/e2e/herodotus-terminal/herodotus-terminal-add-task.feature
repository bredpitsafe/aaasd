Feature: e2e tests: "Herodotus Terminal" page test suit. I as User checks the functionality of "Herodotus Trades" page

  Background:
    Given user selects the "default" server

  @clearIndexedDb
  Scenario Outline: Checking the creation of a task with "<TaskType>" type
    Given user goes to the "Herodotus Terminal" page by name "HerodotusMulti"
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user sees the "Herodotus Terminal" page
    When user opens the "Add Task" tab in the "Herodotus Terminal" page
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
    And user sees the "Task has been added" success message

    Examples:
      | TaskType | BaseAssetType | AmountValue | ExchangeType | AccountType | InstrumentType | MaxPriceValue |
      | Buy      | BTC           | 0.001       | BinanceSpot  | hero.bn     | BTCUSDT        | 2             |
      | Sell     | ETH           | 0.001       | BinanceSpot  | hero.bn     | ETHBTC         | 50            |


  @clearIndexedDb
  Scenario Outline:  Checking the creation of a task with "<TaskType>" type
    Given user goes to the "Herodotus Terminal" page by name "HerodotusMulti"
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user sees the "Herodotus Terminal" page
    When user opens the "Add Task" tab in the "Herodotus Terminal" page
    And user selects task type values:
      | task            | baseAsset         | totalAmount          |
      | <TaskType>      | <BaseAssetType>   | <AmountValue>        |
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
    And user sees the "Task has been added" success message

    Examples:
      | TaskType | BaseAssetType | AmountValue | ExchangeType | AccountType | InstrumentTypeBuy | InstrumentTypeSell | RoleTypeSell | MaxPremiumValue |
      | BuySell  | BTC           | 0.001       | BinanceSpot  | hero.bn     | BTCUSDT           | BTCUSDC            | Hedge        | 5               |


  @clearIndexedDb
  Scenario Outline: Checking that new task contains the reference "www.binance.com"
    Given user goes to the "Herodotus Terminal" page by name "HerodotusMulti"
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user sees the "Herodotus Terminal" page
    And user deletes archive tasks
    And user archive active tasks
    When user opens the "Add Task" tab in the "Herodotus Terminal" page
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
    And user sees the "Task has been added" success message
    And user clicks the "Reset Layout" button in the "Herodotus Terminal" page
    And user waits for "5" seconds
    And user clicks on the last "Arrow" button in the "Active Tasks" tab
    When user checks the "https://www.binance.com/en/trade/BTC_USDT" link in the name in the "Herodotus Terminal"
    And user archive active tasks
    And user clicks on the last "Arrow" button in the "Archived Tasks" tab
    Then user checks the "https://www.binance.com/en/trade/BTC_USDT" link in the name in the "Herodotus Terminal"

    Examples:
      | TaskType | BaseAssetType | AmountValue | ExchangeType | AccountType | InstrumentType | MaxPriceValue |
      | Buy      | BTC           | 0.001       | BinanceSpot  | hero.bn     | BTCUSDT        | 2             |


  @clearIndexedDb
  Scenario Outline: Checking the invisibility of disabled instruments
    Given user goes to the "Herodotus Terminal" page by name "HerodotusMulti"
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user sees the "Herodotus Terminal" page
    When user opens the "Add Task" tab in the "Herodotus Terminal" page
    And user selects task type values:
      | task           | baseAsset        | totalAmount      |
      | <TaskType>     | <BaseAssetType>  | <AmountValue>    |
    And user waits for "5" seconds
    And user sees "Trading" switch in the "Add Task" form
    And user selects instruments values:
      | exchange       | account          | instrument       |
      | <ExchangeType> | <AccountType>    | <InstrumentType> |
    Then user not sees "BTCAUD" instrument in the instrument selector

    Examples:
      | TaskType | BaseAssetType | AmountValue | ExchangeType | AccountType | InstrumentType |
      | Buy      | BTC           | 0.001       | BinanceSpot  | hero.bn     | BTCAUD         |


  @clearIndexedDb
  Scenario Outline: Checking the functionality "Trading" switch in the "Add Task" form
    Given user goes to the "Herodotus Terminal" page by name "HerodotusMulti"
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user sees the "Herodotus Terminal" page
    When user opens the "Add Task" tab in the "Herodotus Terminal" page
    And user selects task type values:
      | task           | baseAsset        | totalAmount      |
      | <TaskType>     | <BaseAssetType>  | <AmountValue>    |
    And user sees "Trading" switch in the "Add Task" form
    And user clicks on the "Trading" switch in the "Add Task" form
    And user waits for "10" seconds
    And user selects instruments values:
      | exchange       | account          | instrument       |
      | <ExchangeType> | <AccountType>    | <InstrumentType> |
    When user sees "Warning" icon in the instrument selector
    And user clicks on the "Trading" switch in the "Add Task" form
    And user types a "BTCUSDT" in the instrument selector
    Then user not sees "Warning" icon in the instrument selector

    Examples:
      | TaskType | BaseAssetType | AmountValue | ExchangeType | AccountType | InstrumentType |
      | Buy      | BTC           | 0.001       | BinanceSpot  | hero.bn     | BTCAUD         |