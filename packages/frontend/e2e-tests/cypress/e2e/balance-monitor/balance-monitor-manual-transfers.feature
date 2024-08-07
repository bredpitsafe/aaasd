Feature: e2e tests: "Balance Monitor" page test suit. I as User checks the functionality of "Balance Monitor" page

  Background:
    Given user selects the "atf-dev" server

  @clearIndexedDb
  Scenario Outline: "Manual Transfer" tab. Checking the functionality of the "Clear" button
    Given user goes to the "Balance Monitor" page on the "Manual Transfer" tab with the backend server parameter
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user sees the "Manual Transfer" tab in the "Balance Monitor" page
    And user selects manual transfer type values:
      | coin    | source    | destination   | amount    |
      | <Coin>  | <Source>  | <Destination> | <Amount>  |
    And user sees data on the "Manual Transfer" form
    And user sees active "Send" button in the "Manual Transfer" form
    When user clicks a "Clear" button in the "Manual Transfer" form
    And user sees not active "Send" button in the "Manual Transfer" form
    Then user not sees data on the "Manual Transfer" form

    Examples:
      | Coin | Source      | Destination | Amount      |
      | AAA  | delta:acc1  | delta:acc1  | 150.1501    |


  @clearIndexedDb
  Scenario Outline: "Manual Transfer" tab. Checking the functionality of the "<NameButton>" button in the "Transfer Confirmation" modal
    Given user goes to the "Balance Monitor" page on the "Manual Transfer" tab with the backend server parameter
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user sees the "Manual Transfer" tab in the "Balance Monitor" page
    And user selects manual transfer type values:
      | coin    | source    | destination   | amount    |
      | <Coin>  | <Source>  | <Destination> | <Amount>  |
    Then user clicks a "Send" button in the "Manual Transfer" form
    And user sees a modal to confirm the operation
    And user sees the "Transfer confirmation" modal
    And user sees "<Coin>,<Source>,<Destination>,<Amount>" in the "Transfer confirmation" modal
    And user clicks on the "<NameButton>" button in the "Transfer confirmation" modal
    Then user not sees the "Transfer confirmation" modal

    Examples:
      | Coin | Source      | Destination | Amount      | NameButton   |
      | AAA  | delta:acc1  | delta:acc1  | 150.1501    | Close        |
      | AAA  | delta:acc1  | delta:acc1  | 150.1501    | Cancel       |


  @clearIndexedDb
  Scenario Outline: "Manual Transfer" tab. Checking the sending of the transfer
    Given user goes to the "Balance Monitor" page on the "Manual Transfer" tab with the backend server parameter
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user sees the "Manual Transfer" tab in the "Balance Monitor" page
    And user selects manual transfer type values:
      | coin    | source    | destination   | amount    |
      | <Coin>  | <Source>  | <Destination> | <Amount>  |
    When user clicks a "Send" button in the "Manual Transfer" form
    And user sees the "Transfer confirmation" modal
    And user clicks on the "Send" button in the "Transfer confirmation" modal
    Then user sees the "Transfer requested successfully" success message
    And  user not sees data on the "Manual Transfer" form

    Examples:
      | Coin | Source      | Destination | Amount      |
      | AAA  | delta:acc1  | delta:acc1  | 150.1501    |


  @clearIndexedDb
  Scenario: Checking fill form "Manual Transfer" tab via the context menu in the "Suggested Transfers" tab
    Given user goes to the "Balance Monitor" page on the "Suggested Transfers" tab with the backend server parameter
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user sees the "Suggested Transfers" tab in the "Balance Monitor" page
    And user selects the send task and selects in the context menu of "Fill Manual Transfer" in the "Suggested Transfers" tab
    And user sees the "Manual Transfer" tab in the "Balance Monitor" page
    And user sees that "coin" fields is disabled
    When user sees data "Suggested Transfers" in the "Manual Transfer" tab
    And user clicks a "Send" button in the "Manual Transfer" form
    And user sees a modal to confirm the operation
    And user sees the "Transfer confirmation" modal
    And user clicks on the "Send" button in the "Transfer confirmation" modal
    Then user sees the "Transfer requested successfully" success message


  @clearIndexedDb
  Scenario: Checking fill form "Manual Transfer" tab via the context menu in the "Transfers History" tab
    Given user goes to the "Balance Monitor" page on the "Transfers History" tab with the backend server parameter
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user sees the "Transfers History" tab in the "Balance Monitor" page
    And user clicks header table "Coin" button
    And user selects the first task and selects in the context menu of "Fill Manual Transfer" in the "Transfers History" tab
    And user sees the "Manual Transfer" tab in the "Balance Monitor" page
    And user sees that "coin" fields is disabled
    And user sees that "account" fields is disabled
    When user clicks a "Send" button in the "Manual Transfer" form
    And user sees a modal to confirm the operation
    And user sees the "Transfer confirmation" modal
    And user clicks on the "Send" button in the "Transfer confirmation" modal
    Then user sees the "Transfer requested successfully" success message


  @clearIndexedDb
  Scenario Outline: "Transfers History" tab. Checking the visibility of the transfer sending via "Manual Transfer" form
    Given user goes to the "Balance Monitor" page with the backend server parameter
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user sees the "Balance Monitor" page
    And user closes all tabs on the "Balance Monitor" page
    And user opens the "Manual Transfer" tab
    And user sees the "Manual Transfer" tab in the "Balance Monitor" page
    And user selects manual transfer type values:
      | coin    | source    | destination   | amount    |
      | <Coin>  | <Source>  | <Destination> | <Amount>  |
    And user clicks a "Send" button in the "Manual Transfer" form
    And user sees the "Transfer confirmation" modal
    When user clicks on the "Send" button in the "Transfer confirmation" modal
    And user sees the "Transfer requested successfully" success message
    And user closes all tabs on the "Balance Monitor" page
    And user opens the "Transfers History" tab
    Then user sees a new transfer sent via "Manual Transfer" tab in the "Transfers History" table

    Examples:
      | Coin | Source      | Destination | Amount      |
      | AAA  | delta:acc1  | delta:acc1  | 150.1501    |


  @clearIndexedDb
  Scenario Outline: "Manual Transfers" tab. Checking the validation of the amount
    Given user goes to the "Balance Monitor" page on the "Suggested Transfers" tab with the backend server parameter
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user sees the "Suggested Transfers" tab in the "Balance Monitor" page
    When user types "XXX" in the input field
    And user selects the first task and selects in the context menu of "Fill Manual Transfer" in the "Suggested Transfers" tab
    And user sees the "Manual Transfer" tab in the "Balance Monitor" page
    And user types "<WarningValue>" in the "Amount" input in the "Manual Transfer" form
    When user sees warning icon in the "Manual Transfer" tab
    And user types "<CorrectValue>" in the "Amount" input in the "Manual Transfer" form
    Then user not sees warning icon in the "Manual Transfer" tab

    Examples:
      | WarningValue | CorrectValue |
      | 9.99         | 10           |
      | 1000.04      | 1000         |


  @clearIndexedDb
  Scenario Outline: "Manual Transfers" tab. Checking the validation of the percent
    Given user goes to the "Balance Monitor" page on the "Manual Transfer" tab with the backend server parameter
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user sees the "Manual Transfer" tab in the "Balance Monitor" page
    And user selects manual transfer type values:
      | coin    | source    | destination   | amount    |
      | <Coin>  | <Source>  | <Destination> | <Amount>  |
    And user sees data on the "Manual Transfer" form
    And user types "<PercentOne>" in the "Percent" input in the "Manual Transfer" form
    And user sees the "<SetPercentOne>" value in the "Manual Transfer" form
    When user sees the "Amount should be greater then 0" error message in the "Manual Transfer" form
    And user types "<PercentTwo>" in the "Percent" input in the "Manual Transfer" form
    Then user sees the "<SetPercentTwo>" value in the "Manual Transfer" form
    And user sees the "Transfer confirmation" modal

    Examples:
      | Coin | Source      | Destination | Amount      | PercentOne | SetPercentOne | PercentTwo | SetPercentTwo |
      | AAA  | delta:acc1  | delta:acc1  | 150.1501    | -5         | 0.0%          | 250        | 100.0%        |

