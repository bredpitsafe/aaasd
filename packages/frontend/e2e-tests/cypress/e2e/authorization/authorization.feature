Feature: e2e tests: "Authorization" test suit. I as User checks the functionality Authorization

  Background:
    Given user selects the "qa" server
#  // waiting for the MVP Authorization
#  Scenario Outline: Stone page. Checking functional "Authorization" on the "<PageType>" page
#    Given user goes to the "Stone" page
#    When user click an the "<PageType>" link
#    Then user on the "<PageType>" page with the "ModalSettings" modal
#    And user types the modal settings with the "default" backend server parameter
#    And user sees the "Authorization" page and logs in as a "LimitUser" user
#    Then user on the "<PageType>" page with the "default" backend server parameter
#    And user not sees data on the "<PageType>" page
#
#    Examples:
#      | PageType                |
#      | Backtesting Manager     |
#      | Trading Servers Manager |
#
#
#  Scenario Outline: Checking functional "Authorization" on the "<PageType>" page
#    Given user goes to the "Stone" page
#    When user click an the "<PageType>" link
#    And user types the modal settings with the "default" backend server parameter
#    And user sees the "Authorization" page and logs in as a "LimitUser" user
#    Then user on the "<PageType>" page with the "default" backend server parameter
#    And user sees the "<PageType>" page
#
#      Examples:
#      | PageType            |
#      | Herodotus Terminal  |
#      | Trading Stats       |
#
#
#  @clearIndexedDb
#  Scenario Outline: Checking functional "Authorization" on the "<PageType>" page
#    Given user goes to the "<PageType>" page with the backend server parameter
#    When user on the "<PageType>" page with the "default" backend server parameter
#    And user sees the "Authorization" page and logs in as a "LimitUser" user
#    Then user not sees data on the "<PageType>" page
#
#    Examples:
#      | PageType                |
#      | Trading Servers Manager |
#      | Backtesting Manager     |
#
#
#  @clearIndexedDb
#  Scenario: Checking functional "Authorization" on the "Trading Stats" page
#    Given user goes to the "Trading Stats" page with the backend server parameter
#    When user on the "Trading Stats" page with the "default" backend server parameter
#    And user sees the "Authorization" page and logs in as a "LimitUser" user
#    Then user sees the "Trading Stats" page


#  @clearIndexedDb
#  Scenario: Checking functional "Authorization" on the "Herodotus Terminal" page by index "1617"
#    Given user goes to the "Herodotus Terminal" page by index "1617"
#    When user on the "Herodotus Terminal" page with the "default" backend server parameter
#    And user sees the "Authorization" page and logs in as a "LimitUser" user
#    Then user on the "Herodotus Terminal" page with the "default" backend server parameter
#    And user sees the "Herodotus Terminal" page
#
#
#  @clearIndexedDb
#  Scenario: Checking functional "Authorization" on the "Herodotus Terminal" page by index "1517"
#    Given user goes to the "Herodotus Terminal" page by index "1517"
#    When user on the "Herodotus Terminal" page with the "default" backend server parameter
#    And user sees the "Authorization" page and logs in as a "LimitUser" user
#    Then user on the "Herodotus Terminal" page with the "default" backend server parameter
#    And user not sees data on the "Herodotus Terminal" page
#

#  @clearIndexedDb
#  Scenario Outline: Checking functional "Log Out" button on the "<PageType>" page
#    Given user goes to the "<PageType>" page with the backend server parameter
#    And user on the "<PageType>" page with the "default" backend server parameter
#    And user sees the "Authorization" page and logs in as a "LimitUser" user
#    And user not sees data on the "<PageType>" page
#    When user click "Log Out" button on the "<PageType>" page
#    And user goes to the "<PageType>" page with the backend server parameter
#    Then user on the "Authorization" page
#
#    Examples:
#      | PageType                |
#      | Trading Servers Manager |
#      | Backtesting Manager     |


#  @clearIndexedDb
#  Scenario: Checking functional "Log Out" button on the "Trading Stats" page
#    Given user goes to the "Trading Stats" page with the backend server parameter
#    And user on the "Trading Stats" page with the "default" backend server parameter
#    And user sees the "Authorization" page and logs in as a "LimitUser" user
#    When user sees the "Trading Stats" page
#    And user click "Log Out" button on the "Trading Stats" page
#    And user goes to the "Trading Stats" page with the backend server parameter
#    Then user on the "Authorization" page
#
#
#  @clearIndexedDb
#  Scenario: Checking the task creation lockout
#    Given user goes to the "Backtesting Manager" page with the backend server parameter
#    And user sees the "Authorization" page and logs in as a "LimitUser" user
#    And user not sees data on the "Backtesting Manager" page
#    And user clicks the "Add Task" button in the menu "Backtesting Manager"
#    And user types random value in the "Common" tab input
#    And user types date in the calendar from "dataTask" object
#    And user types date in the "Config Template" tab
#    And user types date in the "Robots" tab
#    When user clicks the "Create and Run" button in the "Add Task" tab
#    Then user sees the "Socket authentication failed" notification message


#  @clearIndexedDb // waiting for the MVP Authorization
#  Scenario Outline: Checking functional "Authorization" on the "Herodotus Terminal" page by index "1617" // waiting for the MVP Authorization
#    Given user goes to the "Herodotus Terminal" page by index "1617"
#    And user on the "Herodotus Terminal" page with the "default" backend server parameter
#    And user sees the "Authorization" page and logs in as a "LimitUser" user
#    And user on the "Herodotus Terminal" page with the "default" backend server parameter
#    And user sees the "Herodotus Terminal" page
#    And user opens the "Add Task" tab in the "Herodotus Terminal" page
#    And user selects task type values:
#      | task           | baseAsset        | totalAmount      |
#      | <TaskType>     | <BaseAssetType>  | <AmountValue>    |
#    And user selects instruments values:
#      | exchange       | account          | instrument       |
#      | <ExchangeType> | <AccountType>    | <InstrumentType> |
#    And user types price values:
#      | orderAmount    | maxPrice         | aggression       |
#      | <AmountValue>  | <MaxPriceValue>  | <AmountValue>    |
#    When user click "Add Task" button
#    Then user sees the "Task has been added" success message
#
#    Examples:
#      | TaskType | BaseAssetType | AmountValue | ExchangeType | AccountType   | InstrumentType | MaxPriceValue |
#      | Buy      | BTC           | 8           | BinanceSpot  | HRDM.bn.sub10 | BTCUSDT        | 2             |
#
#
#  @clearIndexedDb
#  Scenario Outline: Check that after clicking "Log Out" button the limited user does not sees the data on the "<NameTab>" tab in the "Backtesting Manager" page
#    Given user goes on the "Backtesting Manager" page with the selected "<NameTab>" tab for task by "14/223" ID
#    And user sees the "Authorization" page and logs in as a "Frontend" user
#    And user sees the "<NameTab>" tab on the "Backtesting Manager"
#    And user click "Log Out" button on the "Backtesting Manager" page
#    When user sees the "Authorization" page and logs in as a "LimitUser" user
#    And user not sees data on the "Backtesting Manager" page
#    Then user not sees data on the "<NameTab>" tab
#
#    Examples:
#      | NameTab      |
#      | Product Logs |
#      | Indicators   |
#
#
#  @clearIndexedDb
#  Scenario Outline: Check that after clicking "Log Out" button the limited user does not sees the data on the "<NameTab>" tab in the "Trading Servers Manager" page
#    Given user goes on the "Trading Servers Manager" page with the selected "<NameTab>" tab
#    And user sees the "Authorization" page and logs in as a "Frontend" user
#    When user sees the "Trading Servers Manager" tab
#    And user click "Log Out" button on the "Trading Servers Manager" page
#    Then user sees the "Authorization" page and logs in as a "LimitUser" user
#    And user not sees data on the "Trading Servers Manager" page
#
#    Examples:
#      | NameTab            |
#      | Virtual Accounts   |
#      | Indicators         |


  @clearIndexedDb
  Scenario: Checking visibly the "Indicators" "Dashboard" page
    Given user goes to the "Dashboard" page from "Indicators"
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user sees the menu on the "Dashboard" page
    When user sees labels and headers "Indicators" "Dashboard"
    And user click "Log Out" button on the "Dashboard" page
    And user sees the "Authorization" page and logs in as a "LimitUser" user
    Then user sees labels and headers "Indicators" "Dashboard"