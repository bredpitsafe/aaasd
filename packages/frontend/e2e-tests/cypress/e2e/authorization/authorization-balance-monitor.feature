Feature: e2e tests: "Authorization" test suit. I as User checks the functionality Authorization on the "Balance Monitor" page

  Background:
    Given user selects the "atf-dev" server

  Scenario Outline: Stone page. Checking functional "Authorization" on the "<PageType>" page
    Given user opens the "Balance Monitor" page
    And user sees the "Authorization" page and logs in as a "LimitUser" user
    And user types the modal settings with the "atf-dev" backend server parameter
    When user sees the "Internal Transfers" page of the "Balance Monitor"
    Then user not sees the "<PageType>" page of the "Balance Monitor"

    Examples:
      | PageType         |
      | Balance Monitor  |


  @clearIndexedDb
  Scenario: Checking functional "Authorization" on the "Balance Monitor" page
    Given user goes to the "Balance Monitor" page by "atf-dev" server params
    And user sees the "Authorization" page and logs in as a "LimitUser" user
    And user sees the "Internal Transfers" page of the "Balance Monitor"
    And user not sees the "Balance Monitor" page of the "Balance Monitor"
    When user clicks the "Transfer Blocking Rules" button in the menu "Balance Monitor"
    And user sees the "Transfer Blocking Rules" page of the "Balance Monitor"
    When user clicks the "Amount Limits Rules" button in the menu "Balance Monitor"
    And user sees the "Amount Limits Rules" page of the "Balance Monitor"
    Then user clicks the "Auto Transfer Rules" button in the menu "Balance Monitor"
    And user sees the "Auto Transfer Rules" page of the "Balance Monitor"


  @clearIndexedDb
  Scenario Outline: "Authorization" on the "Internal Transfers" tab. Checking the visibility of a new transfer
    Given user goes to the "Internal Transfers" page in the "Balance Monitor"
    And user sees the "Authorization" page and logs in as a "LimitUser" user
    And user sees the "Internal Transfers" tab in the "Internal Transfers" page
    And user selects internal transfer type values:
      | account    | from    | fromSection   | to    | toSection    | coin    | amount   |
      | <Account>  | <From>  | <FromSection> | <To>  | <ToSection>  | <Coin>  | <Amount> |
    And user clicks a "Send" button in the "Internal Transfers" form
    And user sees a modal to confirm the operation
    When user clicks on the "OK" button in the "Internal transfer confirmation" modal
    And user sees the "Internal transfer requested successfully" success message
    Then user sees new create transfer in the "Internal Transfers History" table

    Examples:
      | Account        | From           | FromSection | To             | ToSection | Coin | Amount |
      | exchange1-main | exchange1-sub2 | spot        | exchange1-sub1 | spot      | BBB  | 0.0001 |


  @clearIndexedDb
  Scenario: "Authorization" on the "Amount Limits Rules" tab. Checking the locking creat a new limit
    Given user goes to the "Amount Limits Rules" page in the "Balance Monitor"
    And user sees the "Authorization" page and logs in as a "LimitUser" user
    When user sees the "Amount Limits Rules" page of the "Balance Monitor"
    And user sees "No Rows To Show" in the table
    Then user sees not active "Create" button in the "Add Amount Limits Rule" form


  @clearIndexedDb
  Scenario Outline: "Authorization" on the "<NamePage>" tab. Checking the locking creat a new rule
    Given user goes to the "<NamePage>" page in the "Balance Monitor"
    And user sees the "Authorization" page and logs in as a "LimitUser" user
    And user sees the "<NamePage>" page of the "Balance Monitor"
    And user sees "No Rows To Show" in the table
    When user clicks a "Create" button in the "Add Auto Transfer Rule" form
    And user sees a modal to confirm the operation
    When user clicks on the "OK" button in the "<NameModal>" modal
    Then user sees the "<NameError>" notification message

    Examples:
      | NamePage                | NameModal                     | NameError                               |
      | Auto Transfer Rules     | Create Auto Transfer Rule     | Failed to create auto transfer rule     |
      | Transfer Blocking Rules | Create Transfer Blocking Rule | Failed to create transfer blocking rule |

