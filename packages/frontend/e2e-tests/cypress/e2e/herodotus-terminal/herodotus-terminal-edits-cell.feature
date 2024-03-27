Feature: e2e tests: "Herodotus Terminal" page test suit. I as User checks the functionality of "Herodotus Trades" page

  Background:
    Given user selects the "qa" server
    Then user sets the "2100" to "1400" screen size

  @clearIndexedDb
  Scenario Outline: Checking the editing of field "<NameInput>" in the "Active Tasks" tab
    Given user goes to the "Herodotus Terminal" page by index "1617"
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user sees the "Herodotus Terminal" page
    And user archive active tasks
    And user deletes all archive tasks
    And user opens the "Add Task" tab in the "Herodotus Terminal" page
    And user selects task type values:
      | task           | baseAsset        | totalAmount      |
      | <TaskType>     | <BaseAssetType>  | <Value>          |
    And user selects instruments values:
      | exchange       | account          | instrument       |
      | <ExchangeType> | <AccountType>    | <InstrumentType> |
    And user types price values:
      | orderAmount    | maxPrice         | aggression       |
      | <Value>        | <MaxPriceValue>  | <Value>          |
    When user click "Add Task" button
    And user sees the successful "Generic command" messages
    And user clicks the "Reset Layout" button in the "Herodotus Terminal" page
    And user sees "<Value>" value in the "<NameInput>" cell
    When user sets "<NewValue>" value in the "<NameInput>" cell
    And user sees the successful "Generic command" messages
    And user not sees "<Value>" value in the "<NameInput>" cell
    Then user sees "<NewValue>" value in the "<NameInput>" cell
    And user deletes all archive tasks

    Examples:
      | TaskType | BaseAssetType | Value | ExchangeType | AccountType   | InstrumentType | MaxPriceValue | NewValue | NameInput   |
      | Buy      | BTC           | 8     | BinanceSpot  | HRDM.bn.sub10 | BTCUSDT        | 2             | 324      | Amount      |
      | Buy      | BTC           | 12    | BinanceSpot  | HRDM.bn.sub10 | BTCUSDT        | 2             | 4        | Order Size  |


  @clearIndexedDb
  Scenario Outline: Checking the editing of field "<NameInput>" in the "Active Tasks" tab
    Given user goes to the "Herodotus Terminal" page by index "1617"
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user sees the "Herodotus Terminal" page
    And user archive active tasks
    And user deletes all archive tasks
    And user opens the "Add Task" tab in the "Herodotus Terminal" page
    And user selects task type values:
      | task           | baseAsset        | totalAmount      |
      | <TaskType>     | <BaseAssetType>  | <Value>          |
    And user selects instruments values:
      | exchange       | account          | instrument       |
      | <ExchangeType> | <AccountType>    | <InstrumentType> |
    And user types price values:
      | orderAmount    | maxPrice         | aggression       |
      | <Value>        | <MaxPriceValue>  | <Value>          |
    When user click "Add Task" button
    And user sees the successful "Generic command" messages
    And user clicks the "Reset Layout" button in the "Herodotus Terminal" page
    And user sees "<SeeValue>" value in the "<NameInput>" cell
    When user sets "<NewValue>" value in the "<NameInput>" cell
    And user sees the successful "Generic command" messages
    And user not sees "<SeeValue>" value in the "<NameInput>" cell
    Then user sees "<SeeNewValue>" value in the "<NameInput>" cell
    And user deletes all archive tasks

    Examples:
      | TaskType | BaseAssetType | Value | SeeValue  | ExchangeType | AccountType   | InstrumentType | MaxPriceValue | NewValue | SeeNewValue | NameInput    |
      | Buy      | BTC           | 8     | 8%        | BinanceSpot  | HRDM.bn.sub10 | BTCUSDT        | 2             | 75       | 75%         | Aggression   |
      | Buy      | BTC           | 12    | $0.05     | BinanceSpot  | HRDM.bn.sub10 | BTCUSDT        | 0.05          | 31500    | $31,500     | Price Limits |


  @clearIndexedDb
  Scenario Outline: Checking the editing of last field "Aggression" in the "Active Tasks" tab
    Given user goes to the "Herodotus Terminal" page by index "1617"
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user sees the "Herodotus Terminal" page
    And user archive active tasks
    And user deletes all archive tasks
    And user opens the "Add Task" tab in the "Herodotus Terminal" page
    And user selects task type values:
      | task           | baseAsset        | totalAmount      |
      | <TaskType>     | <BaseAssetType>  | <Value>          |
    And user selects instruments values:
      | exchange       | account          | instrument       |
      | <ExchangeType> | <AccountType>    | <InstrumentType> |
    And user types price values:
      | orderAmount    | maxPrice         | aggression       |
      | <Value>        | <MaxPriceValue>  | <Value>          |
    When user click "Add Task" button
    And user sees the successful "Generic command" messages
    And user clicks the "Reset Layout" button in the "Herodotus Terminal" page
    And user clicks on the last "Arrow" button in the "Active Tasks" tab
    When user sets "<NewValue>" value in the last "Aggression" cell
    And user sees the successful "Generic command" messages
    Then user sees "<SeeNewValue>" value in the last "Aggression" cell
    And user deletes all archive tasks

    Examples:
      | TaskType | BaseAssetType | Value | ExchangeType | AccountType   | InstrumentType | MaxPriceValue | NewValue | SeeNewValue |
      | Buy      | BTC           | 8     | BinanceSpot  | HRDM.bn.sub10 | BTCUSDT        | 2             | 157.4    | 157.4%      |


  @clearIndexedDb
  Scenario Outline: Checking the "Save" editing field "Roles" in the "Active Tasks" tab
    Given user goes to the "Herodotus Terminal" page by index "1617"
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user sees the "Herodotus Terminal" page
    And user archive active tasks
    And user deletes all archive tasks
    And user opens the "Add Task" tab in the "Herodotus Terminal" page
    And user selects task type values:
      | task            | baseAsset         | totalAmount          |
      | <TaskType>      | <BaseAssetType>   | <AmountValue>        |
    And user waits for "5" seconds
    And user selects "Buy" instruments values:
      | exchange        | account           | instrument           |
      | <ExchangeType>  | <AccountType>     | <InstrumentTypeBuy>  |
    And user selects "Sell" instruments values:
      | exchange        | account           | instrument           | role           |
      | <ExchangeType>  | <AccountType>     | <InstrumentTypeSell> | <RoleTypeSell> |
    And user types premium values:
      | orderAmount     | maxPremium        | aggression           |
      | <AmountValue>   | <MaxPremiumValue> | <AmountValue>        |
    When user click "Add Task" button
    And user sees the successful "Generic command" messages
    And user clicks the "Reset Layout" button in the "Herodotus Terminal" page
    And user clicks on the last "Arrow" button in the "Active Tasks" tab
    And user sees "Hedge" and "Quote" value in the "Role" cells
    When user changes the roles value in the "Role" cells
    And user sees "Save" and "Reset" buttons in the "Status" cell
    When user clicks the "Save" button in the "Status" cell
    And user sees the successful "Generic command" messages
    Then user sees "Quote" and "Hedge" value in the "Role" cells
    And user not sees "Save" and "Reset" buttons in the "Status" cell
    And user deletes all archive tasks

    Examples:
      | TaskType | BaseAssetType | AmountValue | ExchangeType | AccountType   | InstrumentTypeBuy | InstrumentTypeSell | RoleTypeSell | MaxPremiumValue |
      | BuySell  | BTC           | 0.001       | BinanceSpot  | HRDM.bn.sub10 | BTCUSDT           | BTCEUR             | Hedge        | 5               |


  @clearIndexedDb
  Scenario Outline: Checking the "Reset" editing field "Roles" in the "Active Tasks" tab
    Given user goes to the "Herodotus Terminal" page by index "1617"
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user sees the "Herodotus Terminal" page
    And user archive active tasks
    And user deletes all archive tasks
    And user opens the "Add Task" tab in the "Herodotus Terminal" page
    And user selects task type values:
      | task            | baseAsset         | totalAmount          |
      | <TaskType>      | <BaseAssetType>   | <AmountValue>        |
    And user waits for "5" seconds
    And user selects "Buy" instruments values:
      | exchange        | account           | instrument           |
      | <ExchangeType>  | <AccountType>     | <InstrumentTypeBuy>  |
    And user selects "Sell" instruments values:
      | exchange        | account           | instrument           | role           |
      | <ExchangeType>  | <AccountType>     | <InstrumentTypeSell> | <RoleTypeSell> |
    And user types premium values:
      | orderAmount     | maxPremium        | aggression           |
      | <AmountValue>   | <MaxPremiumValue> | <AmountValue>        |
    When user click "Add Task" button
    And user sees the successful "Generic command" messages
    And user clicks the "Reset Layout" button in the "Herodotus Terminal" page
    And user clicks on the last "Arrow" button in the "Active Tasks" tab
    And user sees "Hedge" and "Quote" value in the "Role" cells
    When user changes the roles value in the "Role" cells
    And user sees "Save" and "Reset" buttons in the "Status" cell
    And user clicks the "Reset" button in the "Status" cell
    Then user sees "Hedge" and "Quote" value in the "Role" cells
    And user not sees "Save" and "Reset" buttons in the "Status" cell
    And user deletes all archive tasks

    Examples:
      | TaskType | BaseAssetType | AmountValue | ExchangeType | AccountType   | InstrumentTypeBuy | InstrumentTypeSell | RoleTypeSell | MaxPremiumValue |
      | BuySell  | BTC           | 0.001       | BinanceSpot  | HRDM.bn.sub10 | BTCUSDT           | BTCEUR             | Hedge        | 5               |


  @clearIndexedDb
  Scenario Outline: Checking the visibility of the convertrade value
    Given user goes to the "Herodotus Terminal" page by index "1617"
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user sees the "Herodotus Terminal" page
    And user archive active tasks
    And user deletes all archive tasks
    When user opens the "Add Task" tab in the "Herodotus Terminal" page
    And user selects task type values:
      | task           | baseAsset        | totalAmount      |
      | <TaskType>     | <BaseAssetType>  | <Value>          |
    And user selects instruments values:
      | exchange       | account          | instrument       |
      | <ExchangeType> | <AccountType>    | <InstrumentType> |
    And user types price values:
      | orderAmount    | maxPrice         | aggression       |
      | <Value>        | <MaxPriceValue>  | <Value>          |
    Then user sees convert value in the "Add Task" tab

    Examples:
      | TaskType | BaseAssetType | Value | ExchangeType | AccountType   | InstrumentType | MaxPriceValue |
      | Buy      | BTC           | 8     | BinanceSpot  | HRDM.bn.sub10 | BTCUSDT        | 2             |


  @clearIndexedDb
  Scenario Outline: Checking the setting and resetting of the "Max Price" value for the "<BaseAssetType>" BaseAsset
    Given user goes to the "Herodotus Terminal" page by index "1617"
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user sees the "Herodotus Terminal" page
    And user opens the "Add Task" tab in the "Herodotus Terminal" page
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
      | Buy      | DOGE          | 10    |

