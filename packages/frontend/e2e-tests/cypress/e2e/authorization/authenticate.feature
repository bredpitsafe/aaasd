Feature: e2e tests: "Authenticate" test suit. I as User checks the functionality Authenticate

  Background:
    Given user selects the "qa" server

  @clearIndexedDb
  Scenario: Checking functional "Authenticate" in the "Herodotus Terminal" app by index "1617"
    Given user goes to the "Herodotus Terminal" page by index "1617"
    And user sees the "Authorization" page and logs in as a "Frontend" user
    When user on the "Herodotus Terminal" page with the "default" backend server parameter
    Then user sees the "Herodotus Terminal" page


  @clearIndexedDb
  Scenario: Checking the link to the "Dashboard" page
    Given user goes to the "Dashboard" page of the task with id "71"
    When user sees the "Authorization" page and logs in as a "Frontend" user
    Then user sees the "Dashboard" page


  @clearIndexedDb
  Scenario Outline: Checking functional "Authenticate" in the "<PageType>" app
    Given user goes to the "<PageType>" page by "<ServerName>" server params
    And user sees the "Authorization" page and logs in as a "Frontend" user
    When user on the "<PageType>" page with the "default" backend server parameter
    Then user sees the "<PageType>" page

    Examples:
      | PageType                | ServerName |
      | Trading Servers Manager | qa         |
      | Trading Stats           | qa         |
      | Backtesting Manager     | qa         |
      | Balance Monitor         | atf-dev    |


  @clearIndexedDb
  Scenario Outline: Checking functional "Log Out" button on the "<PageType>" app
    Given user goes to the "<PageType>" page by "<ServerName>" server params
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user on the "<PageType>" page with the "default" backend server parameter
    And user sees the "<PageType>" page
    When user click "Log Out" button on the "<PageType>" page
    Then user on the "Authorization" page

    Examples:
      | PageType                | ServerName |
      | Trading Servers Manager | qa         |
      | Trading Stats           | qa         |
      | Backtesting Manager     | qa         |
      | Balance Monitor         | atf-dev    |


  @clearIndexedDb
  Scenario: Checking functional "Log Out" button on the "Herodotus Terminal" app
    Given user goes to the "Herodotus Terminal" page by index "1617"
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user on the "Herodotus Terminal" page with the "default" backend server parameter
    And user sees the "Herodotus Terminal" page
    When user click "Log Out" button on the "Herodotus Terminal" page
    Then user on the "Authorization" page


  @clearIndexedDb
  Scenario: Checking functional "Log Out" button on the "Dashboard" app
    Given user goes to the "Dashboard" page of the task with id "71"
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user sees the "Dashboard" page
    When user click "Log Out" button on the "Herodotus Terminal" page
    Then user on the "Authorization" page


  @clearIndexedDb
  Scenario Outline: Checking the redirect after "Log Out" button on the "<PageType>" app
    Given user goes to the "<PageType>" page by "<ServerName>" server params
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user sees the "<PageType>" page
    When user click "Log Out" button on the "<PageType>" page
    And user goes to the "<PageType>" page by "<ServerName>" server params
    Then user on the "Authorization" page

    Examples:
      | PageType                | ServerName |
      | Trading Servers Manager | qa         |
      | Trading Stats           | qa         |
      | Backtesting Manager     | qa         |
      | Balance Monitor         | atf-dev    |


  @clearIndexedDb
  Scenario: Checking the redirect after authorization on the "Monthly" page in the "Trading Stats" app
    Given user goes on the "Monthly" page in the "Trading Stats"
    When user sees the "Authorization" page and logs in as a "Frontend" user
    Then user sees the "Monthly" page of the "Trading Stats"


  @clearIndexedDb
  Scenario Outline: Checking the redirect after authorization on the "<NameTab>" tab in the "Backtesting Manager" app
    Given user goes on the "Backtesting Manager" page with the selected "<NameTab>" tab for task by "14/223" ID
    When user sees the "Authorization" page and logs in as a "Frontend" user
    Then user sees the "<NameTab>" tab on the "Backtesting Manager"

    Examples:
      | NameTab      |
      | Product Logs |
      | Indicators   |


  @clearIndexedDb
  Scenario Outline: Checking the redirect after authorization on the "<NameTab>" tab in the "Trading Servers Manager" app
    Given user goes on the "Trading Servers Manager" page with the selected "<NameTab>" tab
    When user sees the "Authorization" page and logs in as a "Frontend" user
    Then user sees the "<NameTab>" tab in the "Trading Servers Manager" page

    Examples:
      | NameTab         |
      | Real Accounts   |
      | Indicators      |


  @clearIndexedDb
  Scenario: Checking the redirect after authorization on the "Config" tab in the "Trading Servers Manager" app
    Given user goes on the "Trading Servers Manager" page with selected "Config" tab of the "BinanceSpot" "Gate"
    When user sees the "Authorization" page and logs in as a "Frontend" user
    Then user sees the "Config" tab in the "Trading Servers Manager" page


  @clearIndexedDb
  Scenario Outline: Checking the redirect after authorization on the "<NamePage>" page in the "Balance Monitor" app
    Given user goes to the "<NamePage>" page in the "Balance Monitor" by "<ServerName>" server params
    When user sees the "Authorization" page and logs in as a "Frontend" user
    Then user sees the "<NamePage>" page of the "Balance Monitor"

    Examples:
      | NamePage            | ServerName |
      | Internal Transfers  | atf-dev    |
      | Auto Transfer Rules | atf-dev    |

