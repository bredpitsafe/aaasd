Feature: e2e tests: "Balance Monitor" page test suit. I as User checks the functionality of "Internal Transfers" page

  Background:
    Given user selects the "atf-dev" server
    Then user sets the "2100" to "1400" screen size

  @clearIndexedDb
  Scenario Outline: Checking visible the "<NameTab>" tab
    Given user goes to the "Internal Transfers" page in the "Balance Monitor"
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user sees the "Internal Transfers" page of the "Balance Monitor"
    And user closes all tabs on the "Balance Monitor" page
    When user opens the "<NameTab>" tab
    Then user sees the "<NameTab>" tab in the "Internal Transfers" page

    Examples:
      | NameTab                     |
      | Internal Transfers          |
      | Internal Transfers History  |


  @clearIndexedDb
  Scenario Outline: Checking completed and cleared in the "Internal Transfers" form
    Given user goes to the "Internal Transfers" page in the "Balance Monitor"
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user sees the "Internal Transfers" tab in the "Internal Transfers" page
    And user sees not active "Send" button in the "Internal Transfers" form
    When user selects internal transfer type values:
      | account    | from    | fromSection   | to    | toSection    | coin    | amount   |
      | <Account>  | <From>  | <FromSection> | <To>  | <ToSection>  | <Coin>  | <Amount> |
    And user sees active "Send" button in the "Internal Transfers" form
    And user sees data on the "Internal Transfers" form
    And user clicks a "Clear" button in the "Internal Transfers" form
    And user sees not active "Send" button in the "Internal Transfers" form
    Then user not sees data on the "Internal Transfers" form

    Examples:
      | Account        | From           | FromSection | To             | ToSection | Coin | Amount |
      | exchange1-main | exchange1-sub1 | spot        | exchange1-sub2 | spot      | BBB  | 0.0001 |


  Scenario Outline: Checking opening the "Transfer confirmation" modal. Checking the functionality of the "Show low balances switch" button
    Given user goes to the "Internal Transfers" page in the "Balance Monitor"
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user sees the "Internal Transfers" tab in the "Internal Transfers" page
    When user selects internal transfer type values:
      | account    | from    | fromSection   | to    | toSection    | coin    | amount   |
      | <Account>  | <From>  | <FromSection> | <To>  | <ToSection>  | <Coin>  | <Amount> |
    And user sees active "Send" button in the "Internal Transfers" form
    And user sees not that "Coin" selector has set value "AAA"
    Then user clicks a "Show low balances switch" button in the "Internal Transfers" form
    And user sees that "Coin" selector has set value "AAA"

    Examples:
      | Account        | From           | FromSection | To             | ToSection | Coin | Amount |
      | exchange1-main | exchange1-sub1 | spot        | exchange1-sub2 | spot      | BBB  | 0.0001 |


  @clearIndexedDb
  Scenario Outline: Checking opening the "Transfer confirmation" modal. Checking the functionality of the "<NameButton>" button
    Given user goes to the "Internal Transfers" page in the "Balance Monitor"
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user sees the "Internal Transfers" tab in the "Internal Transfers" page
    And user selects internal transfer type values:
      | account    | from    | fromSection   | to    | toSection    | coin    | amount   |
      | <Account>  | <From>  | <FromSection> | <To>  | <ToSection>  | <Coin>  | <Amount> |
    And user sees active "Send" button in the "Internal Transfers" form
    And user clicks a "Send" button in the "Internal Transfers" form
    And user sees a modal to confirm the operation
    When user sees "<Account>,<From>,<FromSection>,<To>,<ToSection>,<Coin>,<Amount>" in the "Internal transfer confirmation" modal
    And user clicks on the "<NameButton>" button in the "Internal transfer confirmation" modal
    Then user not sees the "Internal transfer confirmation" modal

    Examples:
      | Account        | From           | FromSection | To             | ToSection | Coin | Amount | NameButton |
      | exchange1-main | exchange1-sub1 | spot        | exchange1-sub2 | spot      | BBB  | 0.0001 | Close      |
      | exchange1-main | exchange1-sub1 | spot        | exchange1-sub2 | spot      | BBB  | 0.0001 | Cancel     |


  @clearIndexedDb
  Scenario Outline: Checking the sending operation in the "Transfer confirmation" modal
    Given user goes to the "Internal Transfers" page in the "Balance Monitor"
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user sees the "Internal Transfers" page of the "Balance Monitor"
    And user sees the "Internal Transfers" tab in the "Internal Transfers" page
    And user selects internal transfer type values:
      | account    | from    | fromSection   | to    | toSection    | coin    | amount   |
      | <Account>  | <From>  | <FromSection> | <To>  | <ToSection>  | <Coin>  | <Amount> |
    And user clicks a "Send" button in the "Internal Transfers" form
    And user sees a modal to confirm the operation
    And user clicks on the "OK" button in the "Internal transfer confirmation" modal
    Then user sees the "Internal transfer requested successfully" success message
    And user not sees data on the "Internal Transfers" form

    Examples:
      | Account        | From           | FromSection | To             | ToSection | Coin | Amount |
      | exchange1-main | exchange1-sub1 | spot        | exchange1-sub2 | spot      | BBB  | 0.0001 |


  @clearIndexedDb
  Scenario Outline: Checking opening the "Transfer confirmation" modal. Checking the visibility of a new transfer
    Given user goes to the "Internal Transfers" page in the "Balance Monitor"
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user sees the "Internal Transfers" page of the "Balance Monitor"
    And user sees the "Internal Transfers" tab in the "Internal Transfers" page
    And user selects internal transfer type values:
      | account    | from    | fromSection   | to    | toSection    | coin    | amount   |
      | <Account>  | <From>  | <FromSection> | <To>  | <ToSection>  | <Coin>  | <Amount> |
    And user clicks a "Send" button in the "Internal Transfers" form
    And user sees a modal to confirm the operation
    And user clicks on the "OK" button in the "Internal transfer confirmation" modal
    And user sees the "Internal transfer requested successfully" success message
    Then user sees new create transfer in the "Internal Transfers History" table

    Examples:
      | Account        | From           | FromSection | To             | ToSection | Coin | Amount |
      | exchange1-main | exchange1-sub2 | spot        | exchange1-sub1 | spot      | BBB  | 0.0001 |


  @clearIndexedDb
  Scenario Outline: Checking the functionality of the filter by "<FilterName>" in the "Internal Transfers History" table
    Given user goes to the "Internal Transfers" page in the "Balance Monitor"
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user sees the "Internal Transfers" page of the "Balance Monitor"
    When user types "<Value>" in the input field
    Then user sees "<Value>" "<FilterName>" in the "Internal Transfers History" table
    And user sees the "filter" parameter in the URL

    Examples:
      | FilterName    | Value          |
      | status        | succeeded      |
      | coin          | BBB            |
      | amount        | 0.0001         |


  @clearIndexedDb
  Scenario: Checking that there is a notice "No Rows To Show" in the "Internal Transfers History" table
    Given user goes to the "Internal Transfers" page in the "Balance Monitor"
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user sees the "Internal Transfers" page of the "Balance Monitor"
    When user types "X?@/Y" in the input field
    Then user sees "No Rows To Show" in the table
    And user sees the "filter" parameter in the URL

