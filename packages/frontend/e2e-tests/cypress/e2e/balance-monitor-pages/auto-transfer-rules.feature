Feature: e2e tests: "Balance Monitor" page test suit. I as User checks the functionality of "Auto Transfer Rules" page

  Background:
    Given user selects the "atf-dev" server
    Then user sets the "2100" to "1400" screen size

  @clearIndexedDb
  Scenario Outline: Checking visible the "<NameTab>" tab in the "Auto Transfer Rules" page
    Given user goes to the "Auto Transfer Rules" page in the "Balance Monitor"
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user sees the "Auto Transfer Rules" page of the "Balance Monitor"
    And user closes all tabs on the "Balance Monitor" page
    When user opens the "<NameTab>" tab
    Then user sees the "<NameTab>" tab in the "Auto Transfer Rules" page

    Examples:
      | NameTab                |
      | Add Auto Transfer Rule |
      | Auto Transfer Rules    |


  @clearIndexedDb
  Scenario: Checking visibility the "Advanced Mode" in the "Add Auto Transfer Rule" form
    Given user goes to the "Auto Transfer Rules" page in the "Balance Monitor"
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user sees the "Add Auto Transfer Rule" tab in the "Auto Transfer Rules" page
    And user sees active "Create" button in the "Add Auto Transfer Rule" form
    When user clicks on the "Advanced Mode" in the "Add Auto Transfer Rule" form
    Then user sees the "Advanced Mode" in the "Add Auto Transfer Rule" form


  @clearIndexedDb
  Scenario Outline: Checking completed and cleared in the "Add Auto Transfer Rule" form
    Given user goes to the "Auto Transfer Rules" page in the "Balance Monitor"
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user sees the "Add Auto Transfer Rule" tab in the "Auto Transfer Rules" page
    When user selects auto transfer rule type values:
      | coin   | sourceExchange   | sourceAccount   | destinationExchange   | destinationAccount   | notes   |
      | <Coin> | <SourceExchange> | <SourceAccount> | <DestinationExchange> | <DestinationAccount> | <Notes> |
    When user sees data on the "Add Auto Transfer Rule" form
    And user clicks a "Clear" button in the "Add Auto Transfer Rule" form
    Then user not sees data on the "Add Auto Transfer Rule" form

    Examples:
      | Coin | SourceExchange | SourceAccount | DestinationExchange | DestinationAccount | Notes |
      | WBN  | XSrcB          | XSrcB:acc1    | XDstB               | XDstB:acc1         | notes |


  @clearIndexedDb
  Scenario: Checking the display of the correct "Source Account"
    Given user goes to the "Auto Transfer Rules" page in the "Balance Monitor"
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user sees the "Add Auto Transfer Rule" tab in the "Auto Transfer Rules" page
    And user selects "WBN" coin in the "Coin" selector
    When user sees "XSrc" in the "Source Exchange" selector
    And user not sees "XDst" in the "Source Exchange" selector
    And user selects "XSrcA" exchange in the "Source Exchange" selector
    When user sees "XSrc" in the "Source Account" selector
    And user not sees "XDst" in the "Source Account" selector


  @clearIndexedDb
  Scenario: Checking the display of the correct "Destination Account"
    Given user goes to the "Auto Transfer Rules" page in the "Balance Monitor"
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user sees the "Add Auto Transfer Rule" tab in the "Auto Transfer Rules" page
    And user selects "WBN" coin in the "Coin" selector
    When user sees "XDst" in the "Destination Exchange" selector
    And user not sees "XSrc" in the "Destination Exchange" selector
    And user selects "XDstA" exchange in the "Destination Exchange" selector
    When user sees "XDst" in the "Destination Account" selector
    And user not sees "XSrc" in the "Destination Account" selector


  @clearIndexedDb
  Scenario Outline: Checking the functionality of "Transit" buttons in the "Add Auto Transfer Rule" form
    Given user goes to the "Auto Transfer Rules" page in the "Balance Monitor"
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user sees the "Add Auto Transfer Rule" tab in the "Auto Transfer Rules" page
    When user selects auto transfer rule type values:
      | coin   | sourceExchange   | sourceAccount   | destinationExchange   | destinationAccount   | notes   |
      | <Coin> | <SourceExchange> | <SourceAccount> | <DestinationExchange> | <DestinationAccount> | <Notes> |
    And user sees data on the "Add Auto Transfer Rule" form
    And user clicks on the "Transit" button near the "Destination Account" field
    When user does not sees the "<DestinationAccount>" value in the "Add Auto Transfer Rule" form
    And user clicks on the "Transit" button near the "Source Account" field
    Then user does not sees the "<SourceAccount>" value in the "Add Auto Transfer Rule" form

    Examples:
      | Coin | SourceExchange | SourceAccount | DestinationExchange | DestinationAccount | Notes |
      | WBN  | XSrcB          | XSrcB:acc1    | XDstB               | XDstB:acc1         | notes |


  @clearIndexedDb
  Scenario Outline: Checking the functionality of "All" buttons in the "Add Auto Transfer Rule" form
    Given user goes to the "Auto Transfer Rules" page in the "Balance Monitor"
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user sees the "Add Auto Transfer Rule" tab in the "Auto Transfer Rules" page
    When user selects auto transfer rule type values:
      | coin   | sourceExchange   | sourceAccount   | destinationExchange   | destinationAccount   | notes   |
      | <Coin> | <SourceExchange> | <SourceAccount> | <DestinationExchange> | <DestinationAccount> | <Notes> |
    And user sees data on the "Add Auto Transfer Rule" form
    And user clicks on the "All" button near the "Destination Account" field
    When user does not sees the "<DestinationAccount>" value in the "Add Auto Transfer Rule" form
    And user clicks on the "All" button near the "Destination Exchange" field
    When user does not sees the "<DestinationExchange>" value in the "Add Auto Transfer Rule" form
    And user clicks on the "All" button near the "Source Account" field
    When user does not sees the "<SourceAccount>" value in the "Add Auto Transfer Rule" form
    And user clicks on the "All" button near the "Source Exchange" field
    When user does not sees the "<SourceExchange>" value in the "Add Auto Transfer Rule" form
    And user clicks on the "All" button near the "Coin" field
    Then user does not sees the "<Coin>" value in the "Add Auto Transfer Rule" form

    Examples:
      | Coin | SourceExchange | SourceAccount | DestinationExchange | DestinationAccount | Notes |
      | WBN  | XSrcB          | XSrcB:acc1    | XDstB               | XDstB:acc1         | notes |


  @clearIndexedDb
  Scenario: Checking the functionality of the "Both directions" switch
    Given user goes to the "Auto Transfer Rules" page in the "Balance Monitor"
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user sees the "Add Auto Transfer Rule" tab in the "Auto Transfer Rules" page
    And user sees that the "Both directions" switch is "Off" in the "Add Auto Transfer Rule" form
    When user clicks on the "Both directions" switch in the "Add Auto Transfer Rule" form
    Then user sees that the "Both directions" switch is "On" in the "Add Auto Transfer Rule" form


  @clearIndexedDb
  Scenario: Checking the functionality of the "Auto Transfer" switch
    Given user goes to the "Auto Transfer Rules" page in the "Balance Monitor"
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user sees the "Add Auto Transfer Rule" tab in the "Auto Transfer Rules" page
    And user sees that the "Auto Transfer" switch is "Enabled" in the "Add Auto Transfer Rule" form
    When user clicks on the "Auto Transfer" switch in the "Add Auto Transfer Rule" form
    Then user sees that the "Auto Transfer" switch is "Disabled" in the "Add Auto Transfer Rule" form


  @clearIndexedDb
  Scenario Outline: Checking the functionality of "<NameButton>" buttons in the "Add Auto Transfer Rule" form
    Given user goes to the "Auto Transfer Rules" page in the "Balance Monitor"
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user sees the "Add Auto Transfer Rule" tab in the "Auto Transfer Rules" page
    When user selects auto transfer rule type values:
      | coin   | sourceExchange   | sourceAccount   | destinationExchange   | destinationAccount   | notes   |
      | <Coin> | <SourceExchange> | <SourceAccount> | <DestinationExchange> | <DestinationAccount> | <Notes> |
    When user clicks a "Create" button in the "Add Auto Transfer Rule" form
    And user sees a modal to confirm the operation
    Then user sees values in the "Create Auto Transfer Rule" modal:
      | <Coin> | <SourceExchange> | <SourceAccount> | <DestinationExchange> | <DestinationAccount> | <Notes> |
    And user clicks on the "<NameButton>" button in the "Create Auto Transfer Rule" modal
    And user not sees the "Create Auto Transfer Rule" modal

    Examples:
      | Coin | SourceExchange | SourceAccount | DestinationExchange | DestinationAccount | Notes | NameButton |
      | WBN  | XSrcB          | XSrcB:acc1    | XDstB               | XDstB:acc1         | notes | Close      |
      | WBN  | XSrcB          | XSrcB:acc1    | XDstB               | XDstB:acc1         | notes | Cancel     |


  @clearIndexedDb
  Scenario Outline: Checking opening the "Create Auto Transfer Rule" modal. Checking the visibility of a new rule
    Given user goes to the "Auto Transfer Rules" page in the "Balance Monitor"
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user sees the "Add Auto Transfer Rule" tab in the "Auto Transfer Rules" page
    And user deletes all rules users "frontend" in the "Auto Transfer Rules" table
    When user selects auto transfer rule type values:
      | coin   | sourceExchange   | sourceAccount   | destinationExchange   | destinationAccount   | notes   |
      | <Coin> | <SourceExchange> | <SourceAccount> | <DestinationExchange> | <DestinationAccount> | <Notes> |
    And user clicks a "Create" button in the "Add Auto Transfer Rule" form
    And user sees a modal to confirm the operation
    When user clicks on the "OK" button in the "Create Auto Transfer Rule" modal
    And user sees the "Auto transfer rule created successfully" success message
    And user not sees data on the "Add Auto Transfer Rule" form
    Then user sees new create auto transfer rule in the "Auto Transfer Rules" table

    Examples:
      | Coin | SourceExchange | SourceAccount | DestinationExchange | DestinationAccount | Notes |
      | WBN  | XSrcB          | XSrcB:acc1    | XDstB               | XDstB:acc1         | notes |


  @clearIndexedDb
  Scenario Outline: Checking the deletion of a rule via the context menu
    Given user goes to the "Auto Transfer Rules" page in the "Balance Monitor"
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user sees the "Add Auto Transfer Rule" tab in the "Auto Transfer Rules" page
    And user deletes all rules users "frontend" in the "Auto Transfer Rules" table
    When user selects auto transfer rule type values:
      | coin   | sourceExchange   | sourceAccount   | destinationExchange   | destinationAccount   | notes   |
      | <Coin> | <SourceExchange> | <SourceAccount> | <DestinationExchange> | <DestinationAccount> | <Notes> |
    And user clicks a "Create" button in the "Add Auto Transfer Rule" form
    And user sees a modal to confirm the operation
    And user clicks on the "OK" button in the "Create Auto Transfer Rule" modal
    And user sees the "Auto transfer rule created successfully" success message
    When user sees new create auto transfer rule in the "Auto Transfer Rules" table
    And user selects a "frontend" rule and selects in the context menu of "Delete Auto Transfer Rule"
    And user sees a modal to confirm the operation
    When user sees values in the "Delete Auto Transfer Rule" modal:
      | <Coin> | <SourceExchange> | <SourceAccount> | <DestinationExchange> | <DestinationAccount> | <Notes> |
    And user clicks on the "OK" button in the "Delete Auto Transfer Rule" modal
    And user sees the "Auto transfer rule deleted successfully" success message
    Then user not sees new create amount limits rule in the "Auto Transfer Rules" table


    Examples:
      | Coin | SourceExchange | SourceAccount | DestinationExchange | DestinationAccount | Notes |
      | WBN  | XSrcB          | XSrcB:acc1    | XDstB               | XDstB:acc1         | notes |


  @clearIndexedDb
  Scenario Outline: Checking the edition of a rule via the context menu
    Given user goes to the "Auto Transfer Rules" page in the "Balance Monitor"
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user sees the "Add Auto Transfer Rule" tab in the "Auto Transfer Rules" page
    And user deletes all rules users "frontend" in the "Auto Transfer Rules" table
    When user selects auto transfer rule type values:
      | coin   | sourceExchange   | sourceAccount   | destinationExchange   | destinationAccount   | notes   |
      | <Coin> | <SourceExchange> | <SourceAccount> | <DestinationExchange> | <DestinationAccount> | <Notes> |
    And user clicks a "Create" button in the "Add Amount Limits Rule" form
    And user sees a modal to confirm the operation
    When user clicks on the "OK" button in the "Create Amount Limits Rule" modal
    And user sees the "Auto transfer rule created successfully" success message
    Then user sees new create auto transfer rule in the "Auto Transfer Rules" table
    And user selects a "frontend" rule and selects in the context menu of "Edit Auto Transfer Rule"
    And user sees values in the "Edit Auto Transfer Rule" modal:
      | <Coin> | <SourceExchange> | <SourceAccount> | <DestinationExchange> | <DestinationAccount> | <Notes> |
    And user edits a rule in the "Edit Auto Transfer Rule" modal
    And user clicks on the "Update" button in the "Edit Auto Transfer Rule" form
    And user sees a modal to confirm the operation
    And user clicks on the "OK" button in the "Update Auto Transfer Rule" modal
    And user sees the "Auto transfer rule updated successfully" success message
    Then user sees updated auto transfer rule in the "Auto Transfer Rules" table

    Examples:
      | Coin | SourceExchange | SourceAccount | DestinationExchange | DestinationAccount | Notes |
      | WBN  | XSrcB          | XSrcB:acc1    | XDstB               | XDstB:acc1         | notes |


  @clearIndexedDb
  Scenario Outline: Checking the functionality of the filter by "<FilterName>" in the "Auto Transfer Rules" table
    Given user goes to the "Auto Transfer Rules" page in the "Balance Monitor"
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user sees the "Add Auto Transfer Rule" tab in the "Auto Transfer Rules" page
    When user types "<Value>" in the input field
    Then user sees "<Value>" "<FilterName>" in the "Auto Transfer Rules" table
    And user sees the "filter" parameter in the URL

    Examples:
      | FilterName    | Value         |
      | userName      | frontend      |
      | coin          | WBN           |
      | sourceAccount | XSrcB:acc1    |


  @clearIndexedDb
  Scenario: Checking that there is a notice "No Rows To Show" in the "Auto Transfer Rules" table
    Given user goes to the "Auto Transfer Rules" page in the "Balance Monitor"
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user sees the "Add Auto Transfer Rule" tab in the "Auto Transfer Rules" page
    When user types "X?@/Y" in the input field
#    Then user sees "No Rows To Show" in the table https://bhft-company.atlassian.net/browse/FRT-1849
    And user sees the "filter" parameter in the URL

