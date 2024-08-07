Feature: e2e tests: "Balance Monitor" page test suit. I as User checks the functionality of "Balance Monitor" page

  Background:
    Given user selects the "atf-dev" server

  @clearIndexedDb
  Scenario: Checking the opening of the "Transfer Confirmation" modal using the "Send" button. Checking the functionality of the "Network" selector
    Given user goes to the "Balance Monitor" page on the "Suggested Transfers" tab with the backend server parameter
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user sees the "Suggested Transfers" tab in the "Balance Monitor" page
    When user clicks on the first "Send" button in the "Suggested Transfers" table
    And user sees the "Transfer confirmation" modal
    And user sees "Auto" in the "Transfer confirmation" modal
    And user selects "ERC20" in the network selectors
    And user sees "ERC20" in the "Transfer confirmation" modal


  @clearIndexedDb
  Scenario Outline: Checking the opening of the "Transfer Confirmation" modal using the "Send" button. Checking the functionality of the "<NameButton>" button
    Given user goes to the "Balance Monitor" page on the "Suggested Transfers" tab with the backend server parameter
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user sees the "Suggested Transfers" tab in the "Balance Monitor" page
    When user clicks on the first "Send" button in the "Suggested Transfers" table
    And user sees the "Transfer confirmation" modal
    And user clicks on the "<NameButton>" button in the "Transfer confirmation" modal
    Then user not sees the "Transfer confirmation" modal

    Examples:
      | NameButton   |
      | Close        |
      | Cancel       |


  @clearIndexedDb
  Scenario: Checking the visibility of data in the "Transfer confirmation" modal in the "Suggested Transfers" tab
    Given user goes to the "Balance Monitor" page on the "Suggested Transfers" tab with the backend server parameter
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user sees the "Suggested Transfers" tab in the "Balance Monitor" page
    And user clicks on the first "Send" button in the "Suggested Transfers" table
    And user sees the "Transfer confirmation" modal
    Then user checks data in the "Transfer confirmation" modal


  @clearIndexedDb
  Scenario: Checking the sending operation in the "Transfer confirmation" modal in the "Suggested Transfers" tab
    Given user goes to the "Balance Monitor" page on the "Suggested Transfers" tab with the backend server parameter
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user sees the "Suggested Transfers" tab in the "Balance Monitor" page
    And user clicks on the first "Send" button in the "Suggested Transfers" table
    And user sees the "Transfer confirmation" modal
    And user clicks on the "Send" button in the "Transfer confirmation" modal
    And user sees the "Transfer requested successfully" success message
    Then user sees progress indicators in the "Suggested Transfers" table


  @clearIndexedDb
  Scenario: Checking the functionality of "Send data to analyze" via the context menu in the "Suggested Transfers" tab
    Given user goes to the "Balance Monitor" page on the "Suggested Transfers" tab with the backend server parameter
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user sees the "Suggested Transfers" tab in the "Balance Monitor" page
    When user selects the first task and selects in the context menu of "Send data to analyse" in the "Suggested Transfers" tab
    Then user sees the "Coin state saved successfully" success message


  @clearIndexedDb
  Scenario: "Transfers History" tab. Checking the visibility of sending a transfer from the "Suggested Transfers" table
    Given user goes to the "Balance Monitor" page with the backend server parameter
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user sees the "Balance Monitor" page
    And user closes all tabs on the "Balance Monitor" page
    And user opens the "Suggested Transfers" tab
    And user sees the "Suggested Transfers" tab in the "Balance Monitor" page
    When user clicks on the first "Send" button in the "Suggested Transfers" table
    And user sees the "Transfer confirmation" modal
    And user clicks on the "Send" button in the "Transfer confirmation" modal
    And user not sees the "Transfer confirmation" modal
    And user sees the "Transfer requested successfully" success message
    And user closes all tabs on the "Balance Monitor" page
    And user opens the "Transfers History" tab
    Then user sees a new transfer sent via "Suggested Transfers" tab in the "Transfers History" table


  @clearIndexedDb
  Scenario Outline: "Suggested Transfers" tab. Checking validation of the TransferAmount value
    Given user goes to the "Balance Monitor" page on the "Suggested Transfers" tab with the backend server parameter
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user sees the "Suggested Transfers" tab in the "Balance Monitor" page
    And user types "XXX" in the input field
    When user edits first "TransferAmount" field and types "<Value>" value
    And user sees a "<TransferValue>" TransferAmount value in the "Suggested Transfers" table
    And user sees warning icon in the "Suggested Transfers" table
    And user clicks on the first reset button in the "Suggested Transfers" table
    Then user not sees warning icon in the "Suggested Transfers" table

    Examples:
      | Value   | TransferValue     |
      | 9.99    | 9.99 ($9)         |
      | 1000.04 | 1,000.04 ($1,000) |


  @clearIndexedDb
  Scenario: "Suggested Transfers" tab. Checking the change of TransferAmount when you change AccountExchange
    Given user goes to the "Balance Monitor" page on the "Suggested Transfers" tab with the backend server parameter
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user sees the "Suggested Transfers" tab in the "Balance Monitor" page
    And user types "XXX" in the input field
    When user edits first "TransferAmount" field and types "200" value
    And user sees a "4.0%" AccountExchange value in the "Suggested Transfers" table
    And user sees a "200.00 ($200)" TransferAmount value in the "Suggested Transfers" table
    And user clicks on the first reset button in the "Suggested Transfers" table
    And user sees a "19.9%" AccountExchange value in the "Suggested Transfers" table
    Then user sees a "998.00 ($998)" TransferAmount value in the "Suggested Transfers" table


  @clearIndexedDb
  Scenario Outline: "Suggested Transfers" tab. Checking validation of the Account/Exchange value
    Given user goes to the "Balance Monitor" page on the "Suggested Transfers" tab with the backend server parameter
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user sees the "Suggested Transfers" tab in the "Balance Monitor" page
    And user types "YYY" in the input field
    When user edits first "AccountExchange" field and types "<Value>" value
    And user sees a "<FieldValue>" AccountExchange value in the "Suggested Transfers" table
    And user clicks on the first reset button in the "Suggested Transfers" table
    Then user sees a "<ResetValue>" AccountExchange value in the "Suggested Transfers" table

    Examples:
      | Value | FieldValue  | ResetValue |
      | -5    | 0.0%        | 12.4%      |
      | 250   | 100.0%      | 12.4%      |


  @clearIndexedDb
  Scenario: "Suggested Transfers" tab. Checking the change of AccountExchange when you change TransferAmount
    Given user goes to the "Balance Monitor" page on the "Suggested Transfers" tab with the backend server parameter
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user sees the "Suggested Transfers" tab in the "Balance Monitor" page
    And user types "YYY" in the input field
    And user edits first "AccountExchange" field and types "50" value
    When user sees a "50.0%" AccountExchange value in the "Suggested Transfers" table
    And user sees a "2,000.00 ($4,000)" TransferAmount value in the "Suggested Transfers" table
    And user clicks on the first reset button in the "Suggested Transfers" table
    And user sees a "12.4%" AccountExchange value in the "Suggested Transfers" table
    Then user sees a "499.00 ($998)" TransferAmount value in the "Suggested Transfers" table


  @clearIndexedDb
  Scenario: "Suggested Transfers" tab. Checking the change of Source when you change Destination
    Given user goes to the "Balance Monitor" page on the "Suggested Transfers" tab with the backend server parameter
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user sees the "Suggested Transfers" tab in the "Balance Monitor" page
    And user types "ZZZ" in the input field
    When user edits first "Source" field and types "beta:acc1" value
    And user sees a "beta:acc1" Source value in the "Suggested Transfers" table
    And user sees a "alpha:acc1" Destination value in the "Suggested Transfers" table
    And user clicks on the first reset button in the "Suggested Transfers" table
    And user sees a "gamma:acc1" Source value in the "Suggested Transfers" table
    And user sees a "alpha:acc1" Destination value in the "Suggested Transfers" table
    When user edits first "Source" field and types "alpha:acc1" value
    And user sees a "alpha:acc1" Source value in the "Suggested Transfers" table
    And user sees a "gamma:acc1" Destination value in the "Suggested Transfers" table
    And user clicks on the first reset button in the "Suggested Transfers" table
    Then user sees a "gamma:acc1" Source value in the "Suggested Transfers" table
    And user sees a "alpha:acc1" Destination value in the "Suggested Transfers" table


  @clearIndexedDb
  Scenario: "Suggested Transfers" tab. Checking the change of Destination when you change Source
    Given user goes to the "Balance Monitor" page on the "Suggested Transfers" tab with the backend server parameter
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user sees the "Suggested Transfers" tab in the "Balance Monitor" page
    And user types "ZZZ" in the input field
    When user edits first "Destination" field and types "beta:acc1" value
    And user sees a "gamma:acc1" Source value in the "Suggested Transfers" table
    And user sees a "beta:acc1" Destination value in the "Suggested Transfers" table
    And user clicks on the first reset button in the "Suggested Transfers" table
    And user sees a "gamma:acc1" Source value in the "Suggested Transfers" table
    And user sees a "alpha:acc1" Destination value in the "Suggested Transfers" table
    When user edits first "Destination" field and types "gamma:acc1" value
    And user sees a "alpha:acc1" Source value in the "Suggested Transfers" table
    And user sees a "gamma:acc1" Destination value in the "Suggested Transfers" table
    And user clicks on the first reset button in the "Suggested Transfers" table
    Then user sees a "gamma:acc1" Source value in the "Suggested Transfers" table
    And user sees a "alpha:acc1" Destination value in the "Suggested Transfers" table

