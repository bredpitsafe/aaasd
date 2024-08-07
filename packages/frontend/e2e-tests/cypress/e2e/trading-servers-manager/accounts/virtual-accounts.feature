Feature: e2e tests: "TSM" page test suit. I as User checks the functionality of "Virtual Accounts" tap

  Background:
    Given user selects the "default" server

  @clearIndexedDb
  Scenario: Checking the selection of the "Virtual Accounts" tab
    Given user goes to the "Trading Servers Manager" page with the backend server parameter
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user sees the name "Servers" in the header
    When user selects the "Virtual Accounts" tab on the "Trading Servers Manager" page
    Then user sees the "Virtual Accounts" tab in the "Trading Servers Manager" page


  @clearIndexedDb
  Scenario: Checking that there is a notice "No Rows To Show"
    Given user goes on the "Trading Servers Manager" page with the selected "Virtual Accounts" tab
    And user sees the "Authorization" page and logs in as a "Frontend" user
    When user types "X?@/Y" in the input field
    Then user sees "No Rows To Show" in the table


  @clearIndexedDb
  Scenario: Checking the visible of an existing account
    Given user goes on the "Trading Servers Manager" page with the selected "Virtual Accounts" tab
    And user sees the "Authorization" page and logs in as a "Frontend" user
    When user types "AutotestVirtualAccount" name in the "Virtual Accounts" input
    Then user sees "Name" from the "AutotestVirtualAccount" user
    And user clicks on the first "Arrow" button in the table row
    And user sees all parameters "Virtual Account" from the "Autotest" user


  @clearIndexedDb
  Scenario: Checking opens exist account
    Given user goes on the "Trading Servers Manager" page with the selected "Virtual Accounts" tab
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user types "AutotestVirtualAccount" name in the "Virtual Accounts" input
    When user opens the "Virtual Accounts" modal of the "AutotestVirtualAccount" user
    Then user sees the "Virtual Accounts" modal of the "Autotest" user


  @clearIndexedDb
  Scenario: Checking opens connection "Real Account"
    Given user goes on the "Trading Servers Manager" page with the selected "Virtual Accounts" tab
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user types "AutotestVirtualAccount" name in the "Virtual Accounts" input
    When user opens the "Real Accounts" modal of the "AutotestVirtualAccount" user
    Then user sees the "Real Accounts" modal of the "Autotest" user


  @clearIndexedDb
  Scenario: Checking the "New Virtual Account" modal opening
    Given user goes on the "Trading Servers Manager" page with the selected "Virtual Accounts" tab
    And user sees the "Authorization" page and logs in as a "Frontend" user
    When user clicks on the "New Virtual Account" button
    Then user sees "Create Virtual Account" modal


  @clearIndexedDb
  Scenario Outline: "New Real Account" modal. Checking the functionality of the "<NameButton>" button
    Given user goes on the "Trading Servers Manager" page with the selected "Virtual Accounts" tab
    And user sees the "Authorization" page and logs in as a "Frontend" user
    When user clicks on the "New Virtual Account" button
    And user sees "Create Virtual Account" modal
    Then user clicks on the "<NameButton>" button in the "Creat Account" modal
    And user not sees the "Creat Account" modal

    Examples:
      | NameButton   |
      | Close        |
      | Cancel       |


  @clearIndexedDb
  Scenario: Creating a new account. Error creating account: account already exists
    Given user goes to the "Trading Servers Manager" page with the backend server parameter
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user selects the "Virtual Accounts" tab on the "Trading Servers Manager" page
    And user clicks on the "New Virtual Account" button
    And user types "AutotestVirtualAccount" in the "Virtual Account Name" input
    And user types "AutotestRealAccount" in the "Real Accounts" input
    When user clicks on the "Save" button in the "Creat Account" modal
    Then user sees the "duplicate entity AutotestVirtualAccount" notification message


  @clearIndexedDb
  Scenario: Creating a new account. Check added and deleted the "Real Account"
    Given user goes to the "Trading Servers Manager" page with the backend server parameter
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user selects the "Virtual Accounts" tab on the "Trading Servers Manager" page
    And user clicks on the "New Virtual Account" button
    And user types "AutotestVirtualAccount" in the "Virtual Account Name" input
    And user types "AutotestRealAccount" in the "Real Accounts" input
    And user sees "Save" button that is "enabled"
    When user clicks on the "Delete" "Real Account" button
    Then user sees "Save" button that is "disabled"

