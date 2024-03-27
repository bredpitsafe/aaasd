Feature: e2e tests: "Balance Monitor" page test suit. I as User checks the functionality of "Balance Monitor" page

  Background:
    Given user selects the "atf-dev" server

  @clearIndexedDb
  Scenario Outline: Checking visible the "<NameTab>" table
    Given user goes to the "Balance Monitor" page with the backend server parameter
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user sees the "Balance Monitor" page
    And user closes all tabs on the "Balance Monitor" page
    When user opens the "<NameTab>" tab
    Then user sees the "<NameTab>" tab in the "Balance Monitor" page
    And user sees data in the "<NameTab>" table on the "Balance Monitor" page

    Examples:
      | NameTab                |
      | Suggested Transfers    |
      | Transfers History      |
      | Coin Transfer Details  |


  @clearIndexedDb
  Scenario: "Coin Transfer Details" table. Checking the functionality of the "Refresh" button
    Given user goes to the "Balance Monitor" page with the backend server parameter
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user sees the "Balance Monitor" page
    And user closes all tabs on the "Balance Monitor" page
    When user opens the "Coin Transfer Details" tab
    And user sees the "Coin Transfer Details" tab in the "Balance Monitor" page
    And user sees "No Rows To Show" in the table
    When user sets the "AAA" coin in the filter selector
    And user sees data in the "Coin Transfer Details" table on the "Balance Monitor" page
    And user clicks a "Refresh" button in the "Coin Transfer Details" table
    Then user sees "Loading..." in the table


  @clearIndexedDb
  Scenario Outline: Checking the "Distribution" tab opening when selecting a coin in the "<NameTable>" table
    Given user goes to the "Balance Monitor" page with the backend server parameter
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user sees the "Balance Monitor" page
    And user closes all tabs on the "Balance Monitor" page
    And user opens the "<NameTable>" tab
    When user selects the "<NameCoin>" coin in the "<NameTable>" table
    And user opens the "Distribution" tab
    Then user sees the selected coin "<NameCoin>" in the "Distribution" tab
    And user sees a graph in the "Distribution" tab"

    Examples:
      | NameTable              | NameCoin    |
      | Suggested Transfers    | AAA         |
      | Transfers History      | WBN         |
      | Coin Transfer Details  | CAA         |


  @clearIndexedDb
  Scenario Outline: Checking the functionality of the filter by "<FilterName>" in the "Suggested Transfers" table
    Given user goes to the "Balance Monitor" page with the backend server parameter
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user sees the "Balance Monitor" page
    And user closes all tabs on the "Balance Monitor" page
    And user opens the "Suggested Transfers" tab
    When user types "<Value>" in the input field
    Then user sees "<Value>" "<FilterName>" in the "Suggested Transfers" table
    And user sees the "filter" parameter in the URL

    Examples:
      | FilterName   | Value         |
      | coin         | AAA           |
      | source       | XSrcB:acc1    |
      | destination  | delta:acc2    |


  @clearIndexedDb
  Scenario Outline: Checking the functionality of the filter by "<FilterName>" in the "Transfers History" table
    Given user goes to the "Balance Monitor" page with the backend server parameter
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user sees the "Balance Monitor" page
    And user closes all tabs on the "Balance Monitor" page
    And user opens the "Transfers History" tab
    When user types "<Value>" in the input field
    Then user sees "<Value>" "<FilterName>" in the "Transfers History" table
    And user sees the "filter" parameter in the URL

    Examples:
      | FilterName   | Value        |
      | status       | sent         |
      | coin         | WBN          |
      | source       | XSrcB:acc2   |


  @clearIndexedDb
  Scenario Outline: Checking the functionality of the filter by "<FilterName>" in the "Coin Transfer Details" table
    Given user goes to the "Balance Monitor" page with the backend server parameter
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user sees the "Balance Monitor" page
    And user closes all tabs on the "Balance Monitor" page
    And user opens the "Coin Transfer Details" tab
    And user sets the "CAA" coin in the filter selector
    When user types "<Value>" in the input field
    Then user sees "<Value>" "<FilterName>" in the "Coin Transfer Details" table
    And user sees the "filter" parameter in the URL

    Examples:
      | FilterName   | Value        |
      | network      | ERC20        |
      | source       | XSrcA:acc2   |


  @clearIndexedDb
  Scenario Outline: Checking that there is a notice "No Rows To Show" in the "<NameTable>" table
    Given user goes to the "Balance Monitor" page with the backend server parameter
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user sees the "Balance Monitor" page
    And user closes all tabs on the "Balance Monitor" page
    And user opens the "<NameTable>" tab
    When user types "X?@/Y" in the input field
    Then user sees "No Rows To Show" in the table
    And user sees the "filter" parameter in the URL

    Examples:
      | NameTable              |
#      | Suggested Transfers    | https://bhft-company.atlassian.net/browse/FRT-1849
      | Transfers History      |
      | Coin Transfer Details  |

