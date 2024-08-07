Feature: e2e tests: "Balance Monitor" page test suit. I as User checks the functionality of "Transfer blocking rule" page

  Background:
    Given user selects the "atf-dev" server
    Then user sets the "2100" to "1400" screen size

  @clearIndexedDb
  Scenario Outline: Checking visible the "<NameTab>" tab  in the "Transfer Blocking Rules" page
    Given user goes to the "Transfer Blocking Rules" page in the "Balance Monitor"
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user sees the "Transfer Blocking Rules" page of the "Balance Monitor"
    And user closes all tabs on the "Balance Monitor" page
    When user opens the "<NameTab>" tab
    Then user sees the "<NameTab>" tab in the "Transfer Blocking Rules" page

    Examples:
      | NameTab                     |
      | Add Transfer Blocking Rule  |
      | Transfer Blocking Rules     |


  @clearIndexedDb
  Scenario Outline: Checking completed and cleared in the "Add Transfer Blocking Rule" form
    Given user goes to the "Transfer Blocking Rules" page in the "Balance Monitor"
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user sees the "Add Transfer Blocking Rule" tab in the "Transfer Blocking Rules" page
    And user selects transfer blocking rule type values:
      | coin   | sourceExchange   | sourceAccount   | destinationExchange   | destinationAccount   | notes   |
      | <Coin> | <SourceExchange> | <SourceAccount> | <DestinationExchange> | <DestinationAccount> | <Notes> |
    When user sees data on the "Add Transfer Blocking Rule" form
    And user clicks a "Clear" button in the "Add Transfer Blocking Rule" form
    Then user not sees data on the "Add Transfer Blocking Rule" form

    Examples:
      | Coin | SourceExchange | SourceAccount | DestinationExchange | DestinationAccount | Notes |
      | AAA  | delta          | delta:acc1    | epsilon             | epsilon:acc1       | notes |


  @clearIndexedDb
  Scenario: Checking the display of the correct "Source Account"
    Given user goes to the "Transfer Blocking Rules" page in the "Balance Monitor"
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user sees the "Add Transfer Blocking Rule" tab in the "Transfer Blocking Rules" page
    And user selects "WBN" coin in the "Coin" selector
    When user sees "XSrc" in the "Source Exchange" selector
    And user not sees "XDst" in the "Source Exchange" selector
    And user selects "XSrcA" exchange in the "Source Exchange" selector
    When user sees "XSrc" in the "Source Account" selector
    And user not sees "XDst" in the "Source Account" selector


  @clearIndexedDb
  Scenario: Checking the display of the correct "Destination Account"
    Given user goes to the "Transfer Blocking Rules" page in the "Balance Monitor"
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user sees the "Add Transfer Blocking Rule" tab in the "Transfer Blocking Rules" page
    And user selects "WBN" coin in the "Coin" selector
    When user sees "XDst" in the "Destination Exchange" selector
    And user not sees "XSrc" in the "Destination Exchange" selector
    And user selects "XDstA" exchange in the "Destination Exchange" selector
    When user sees "XDst" in the "Destination Account" selector
    And user not sees "XSrc" in the "Destination Account" selector


  @clearIndexedDb
  Scenario Outline: Checking the functionality of "Transit" buttons in the "Add Transfer Blocking Rule" form
    Given user goes to the "Transfer Blocking Rules" page in the "Balance Monitor"
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user sees the "Add Transfer Blocking Rule" tab in the "Transfer Blocking Rules" page
    When user selects transfer blocking rule type values:
      | coin   | sourceExchange   | sourceAccount   | destinationExchange   | destinationAccount   | notes   |
      | <Coin> | <SourceExchange> | <SourceAccount> | <DestinationExchange> | <DestinationAccount> | <Notes> |
    When user sees data on the "Add Transfer Blocking Rule" form
    And user clicks on the "Transit" button near the "Destination Account" field
    Then user does not sees the "<DestinationAccount>" value in the "Add Transfer Blocking Rule" form
    And user clicks on the "Transit" button near the "Source Account" field
    And user does not sees the "<SourceAccount>" value in the "Add Transfer Blocking Rule" form

    Examples:
      | Coin | SourceExchange | SourceAccount | DestinationExchange | DestinationAccount | Notes |
      | AAA  | delta          | delta:acc1    | epsilon             | epsilon:acc1       | notes |


  @clearIndexedDb
  Scenario Outline: Checking the functionality of "All" buttons in the "Add Transfer Blocking Rule" form
    Given user goes to the "Transfer Blocking Rules" page in the "Balance Monitor"
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user sees the "Add Transfer Blocking Rule" tab in the "Transfer Blocking Rules" page
    And user selects transfer blocking rule type values:
      | coin   | sourceExchange   | sourceAccount   | destinationExchange   | destinationAccount   | notes   |
      | <Coin> | <SourceExchange> | <SourceAccount> | <DestinationExchange> | <DestinationAccount> | <Notes> |
    Then user sees data on the "Add Transfer Blocking Rule" form
    And user clicks on the "All" button near the "Destination Account" field
    And user does not sees the "<DestinationAccount>" value in the "Add Transfer Blocking Rule" form
    And user clicks on the "All" button near the "Destination Exchange" field
    And user does not sees the "<DestinationExchange>" value in the "Add Transfer Blocking Rule" form
    And user clicks on the "All" button near the "Source Account" field
    And user does not sees the "<SourceAccount>" value in the "Add Transfer Blocking Rule" form
    And user clicks on the "All" button near the "Source Exchange" field
    And user does not sees the "<SourceExchange>" value in the "Add Transfer Blocking Rule" form
    And user clicks on the "All" button near the "Coin" field
    And user does not sees the "<Coin>" value in the "Add Transfer Blocking Rule" form

    Examples:
      | Coin | SourceExchange | SourceAccount | DestinationExchange | DestinationAccount | Notes |
      | AAA  | delta          | delta:acc1    | epsilon             | epsilon:acc1       | notes |


  @clearIndexedDb
  Scenario: Checking the functionality of the "Disabled" selector
    Given user goes to the "Transfer Blocking Rules" page in the "Balance Monitor"
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user sees the "Add Transfer Blocking Rule" tab in the "Transfer Blocking Rules" page
    And user sees that the "Suggest + Manual" in the "Disabled" selector
    And user selects the "Manual" of the "Disabled" selector
    And user sees that the "Manual" in the "Disabled" selector
    And user selects the "Suggest" of the "Disabled" selector
    And user sees that the "Suggest" in the "Disabled" selector
    And user selects the "Suggest + Manual" of the "Disabled" selector
    And user sees that the "Suggest + Manual" in the "Disabled" selector


  @clearIndexedDb
  Scenario Outline: Checking the functionality of the "<NameSwitch>" switch
    Given user goes to the "Transfer Blocking Rules" page in the "Balance Monitor"
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user sees the "Add Transfer Blocking Rule" tab in the "Transfer Blocking Rules" page
    And user sees that the "<NameSwitch>" switch is "<ValueOne>" in the "Add Transfer Blocking Rule" form
    And user clicks on the "<NameSwitch>" switch in the "Add Transfer Blocking Rule" form
    And user sees that the "<NameSwitch>" switch is "<ValueTwo>" in the "Add Transfer Blocking Rule" form

    Examples:
      | NameSwitch      | ValueOne | ValueTwo |
      | Both directions | On       | Off      |
      | Alert           | Show     | Hide     |


  @clearIndexedDb
  Scenario: Checking the functionality of the "Permanent" switch
    Given user goes to the "Transfer Blocking Rules" page in the "Balance Monitor"
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user sees the "Add Transfer Blocking Rule" tab in the "Transfer Blocking Rules" page
    And user sees that the "Permanent" switch is "On" in the "Add Transfer Blocking Rule" form
    And user clicks on the "Permanent" switch in the "Add Transfer Blocking Rule" form
    And user sees that the "Permanent" switch is "Off" in the "Add Transfer Blocking Rule" form
    And user sees the "Start time" and "End time" switches
    And user sees that the "Start time" switch is "Now" in the "Add Transfer Blocking Rule" form
    And user sees that the "End time" switch is "Custom" in the "Add Transfer Blocking Rule" form
    And user clicks on the "Start time" switch in the "Add Transfer Blocking Rule" form
    And user sees that the "Start time" switch is "Custom" in the "Add Transfer Blocking Rule" form
    And user sees the "Start time" and "End time" input field
    And user clicks on the "End time" switch in the "Add Transfer Blocking Rule" form
    And user sees that the "End time" switch is "Period" in the "Add Transfer Blocking Rule" form
    And user sees the "Period" input field in the "Add Transfer Blocking Rule" form
    And user sees the "Days" and "Hours" selector in the "Add Transfer Blocking Rule" form


  @clearIndexedDb
  Scenario Outline: Checking opening the "Create Transfer Blocking Rule" modal. Checking the functionality of the "<NameButton>" button
    Given user goes to the "Transfer Blocking Rules" page in the "Balance Monitor"
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user sees the "Add Transfer Blocking Rule" tab in the "Transfer Blocking Rules" page
    And user selects transfer blocking rule type values:
      | coin   | sourceExchange   | sourceAccount   | destinationExchange   | destinationAccount   | notes   |
      | <Coin> | <SourceExchange> | <SourceAccount> | <DestinationExchange> | <DestinationAccount> | <Notes> |
    And user clicks a "Create" button in the "Add Transfer Blocking Rule" form
    And user sees a modal to confirm the operation
    Then user sees values in the "Create Transfer Blocking Rule" modal:
      | <Coin> | <SourceExchange> | <SourceAccount> | <DestinationExchange> | <DestinationAccount> | <Notes> |
    And user clicks on the "<NameButton>" button in the "Create Transfer Blocking Rule" modal
    Then user not sees the "Create Transfer Blocking Rule" modal

    Examples:
      | Coin | SourceExchange | SourceAccount | DestinationExchange | DestinationAccount | Notes | NameButton |
      | AAA  | delta          | delta:acc1    | epsilon             | epsilon:acc1       | notes | Close      |
      | AAA  | delta          | delta:acc1    | epsilon             | epsilon:acc1       | notes | Cancel     |


  @clearIndexedDb
  Scenario Outline: Checking opening the "Create Transfer Blocking Rule" modal. Checking the visibility of a new rule
    Given user goes to the "Transfer Blocking Rules" page in the "Balance Monitor"
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user sees the "Transfer Blocking Rules" page of the "Balance Monitor"
    And user deletes all rules users "frontend" in the "Transfer Blocking Rules" table
    And user selects transfer blocking rule type values:
      | coin   | sourceExchange   | sourceAccount   | destinationExchange   | destinationAccount   | notes   |
      | <Coin> | <SourceExchange> | <SourceAccount> | <DestinationExchange> | <DestinationAccount> | <Notes> |
    And user clicks on the "Permanent" switch in the "Add Transfer Blocking Rule" form
    And user sets the date "2025-01-01" in the "End time" calendar
    And user clicks a "Create" button in the "Add Transfer Blocking Rule" form
    And user sees a modal to confirm the operation
    When user clicks on the "OK" button in the "Create Transfer Blocking Rule" modal
    And user sees the "Transfer blocking rule created successfully" success message
    And user not sees data on the "Add Transfer Blocking Rule" form
    Then user sees new create transfer blocking rule in the "Transfer Blocking Rules" table

    Examples:
      | Coin | SourceExchange | SourceAccount | DestinationExchange | DestinationAccount | Notes |
      | AAA  | delta          | delta:acc1    | epsilon             | epsilon:acc1       | notes |


    @clearIndexedDb
  Scenario Outline: Checking the deletion of a rule via the context menu
    Given user goes to the "Transfer Blocking Rules" page in the "Balance Monitor"
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user sees the "Transfer Blocking Rules" page of the "Balance Monitor"
    And user deletes all rules users "frontend" in the "Transfer Blocking Rules" table
    And user selects transfer blocking rule type values:
      | coin   | sourceExchange   | sourceAccount   | destinationExchange   | destinationAccount   | notes   |
      | <Coin> | <SourceExchange> | <SourceAccount> | <DestinationExchange> | <DestinationAccount> | <Notes> |
    And user clicks a "Create" button in the "Add Transfer Blocking Rule" form
    And user sees a modal to confirm the operation
    And user clicks on the "OK" button in the "Create Transfer Blocking Rule" modal
    When user sees new create transfer blocking rule in the "Transfer Blocking Rules" table
    And user selects a "frontend" rule and selects in the context menu of "Delete Transfer Blocking Rule"
    And user sees a modal to confirm the operation
    When user sees values in the "Delete Transfer Blocking Rule" modal:
      | <Coin> | <SourceExchange> | <SourceAccount> | <DestinationExchange> | <DestinationAccount> | <Notes> |
    And user clicks on the "OK" button in the "Delete Transfer Blocking Rule" modal
    And user sees the "Transfer blocking rule deleted successfully" success message
    Then user not sees new create transfer blocking rule in the "Transfer Blocking Rules" table

    Examples:
      | Coin | SourceExchange | SourceAccount | DestinationExchange | DestinationAccount | Notes |
      | AAA  | delta          | delta:acc1    | epsilon             | epsilon:acc1       | notes |


  @clearIndexedDb
  Scenario Outline: Checking the edition of a rule via the context menu
    Given user goes to the "Transfer Blocking Rules" page in the "Balance Monitor"
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user sees the "Transfer Blocking Rules" page of the "Balance Monitor"
    And user deletes all rules users "frontend" in the "Transfer Blocking Rules" table
    And user selects transfer blocking rule type values:
      | coin   | sourceExchange   | sourceAccount   | destinationExchange   | destinationAccount   | notes   |
      | <Coin> | <SourceExchange> | <SourceAccount> | <DestinationExchange> | <DestinationAccount> | <Notes> |
    And user clicks a "Create" button in the "Add Transfer Blocking Rule" form
    And user sees a modal to confirm the operation
    And user clicks on the "OK" button in the "Create Transfer Blocking Rule" modal
    When user sees new create transfer blocking rule in the "Transfer Blocking Rules" table
    And user selects a "frontend" rule and selects in the context menu of "Edit Transfer Blocking Rule"
    And user sees values in the "Edit Transfer Blocking Rule" modal:
      | <Coin> | <SourceExchange> | <SourceAccount> | <DestinationExchange> | <DestinationAccount> | <Notes> |
    And user edits a rule in the "Edit Transfer Blocking Rule" modal
    And user clicks on the "Update" button in the "Edit Transfer Blocking Rule" form
    And user sees a modal to confirm the operation
    And user clicks on the "OK" button in the "Update Transfer Blocking Rule" modal
    And user sees the "Transfer blocking rule updated successfully" success message
    Then user sees updated transfer blocking rule in the "Transfer Blocking Rules" table

    Examples:
      | Coin | SourceExchange | SourceAccount | DestinationExchange | DestinationAccount | Notes |
      | AAA  | delta          | delta:acc1    | epsilon             | epsilon:acc1       | notes |


  @clearIndexedDb
  Scenario Outline: Checking the functionality of the filter by "<FilterName>" in the "Transfer Blocking Rules" table
    Given user goes to the "Transfer Blocking Rules" page in the "Balance Monitor"
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user sees the "Transfer Blocking Rules" page of the "Balance Monitor"
    When user types "<Value>" in the input field
    Then user sees "<Value>" "<FilterName>" in the "Transfer Blocking Rules" table
    And user sees the "filter" parameter in the URL

    Examples:
      | FilterName    | Value        |
      | userName      | frontend     |
      | coin          | AAA          |
      | sourceAccount | delta:acc1   |
      | status        | active       |


  @clearIndexedDb
  Scenario: Checking that there is a notice "No Rows To Show" in the "Transfer Blocking Rules" table
    Given user goes to the "Transfer Blocking Rules" page in the "Balance Monitor"
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user sees the "Transfer Blocking Rules" page of the "Balance Monitor"
    When user types "X?@/Y" in the input field
#    Then user sees "No Rows To Show" in the table https://bhft-company.atlassian.net/browse/FRT-1849
    And user sees the "filter" parameter in the URL

