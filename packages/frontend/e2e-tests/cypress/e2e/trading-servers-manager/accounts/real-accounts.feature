Feature: e2e tests: "TSM" page test suit. I as User checks the functionality of "Real Accounts" tap

  Background:
    Given user selects the "default" server

  @clearIndexedDb
  Scenario: Checking the selection of the "Real Accounts" tab
    Given user goes to the "Trading Servers Manager" page with the backend server parameter
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user sees the name "Servers" in the header
    When user selects the "Real Accounts" tab on the "Trading Servers Manager" page
    Then user sees the "Real Accounts" tab in the "Trading Servers Manager" page


  @clearIndexedDb
  Scenario: Checking that there is a notice "No Rows To Show"
    Given user goes on the "Trading Servers Manager" page with the selected "Real Accounts" tab
    And user sees the "Authorization" page and logs in as a "Frontend" user
    When user types "X?@/Y" in the input field
    Then user sees "No Rows To Show" in the table


  @clearIndexedDb
  Scenario: Checking the visible of an existing account
    Given user goes on the "Trading Servers Manager" page with the selected "Real Accounts" tab
    And user sees the "Authorization" page and logs in as a "Frontend" user
    When user types "AutotestRealAccount" name in the "Real Accounts" input
    Then user sees "Name" and "Exchange Account ID" from the "AutotestRealAccount" user
    And user clicks on the first "Arrow" button in the table row
    And user sees all parameters "Real Account" from the "Autotest" user


  @clearIndexedDb
  Scenario: Checking opens exist "Real Account"
    Given user goes on the "Trading Servers Manager" page with the selected "Real Accounts" tab
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user types "AutotestRealAccount" name in the "Real Accounts" input
    When user opens the "Real Accounts" modal of the "Autotest" user
    Then user sees the "Real Accounts" modal of the "Autotest" user


  @clearIndexedDb
  Scenario: Checking the "New Real Account" modal opening
    Given user goes on the "Trading Servers Manager" page with the selected "Real Accounts" tab
    And user sees the "Authorization" page and logs in as a "Frontend" user
    When user clicks on the "New Real Account" button
    Then user sees "Create Real Account" modal


  @clearIndexedDb
  Scenario Outline: "New Real Account" modal. Checking the functionality of the "<NameButton>" button
    Given user goes on the "Trading Servers Manager" page with the selected "Real Accounts" tab
    And user sees the "Authorization" page and logs in as a "Frontend" user
    When user clicks on the "New Real Account" button
    And user sees "Create Real Account" modal
    Then user clicks on the "<NameButton>" button in the "Creat Account" modal
    And user not sees the "Creat Account" modal

    Examples:
      | NameButton   |
      | Close        |
      | Cancel       |


  @clearIndexedDb
  Scenario: "New Real Account" modal. Checking the functionality of the "Arrow" button
    Given user goes on the "Trading Servers Manager" page with the selected "Real Accounts" tab
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user clicks on the "New Real Account" button
    And user sees "Create Real Account" modal
    When user clicks on the "Credentials" arrow (closes the credential input) And not sees "Credentials" input
    Then user clicks on the "Credentials" arrow (opens the credential input) And sees "Credentials" input


  @clearIndexedDb
  Scenario: "New Real Account" modal. Check added and delete the "Credentials" params
    Given user goes on the "Trading Servers Manager" page with the selected "Real Accounts" tab
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user clicks on the "New Real Account" button
    And user deletes the "Credentials" params from the modal
    And user types "AutotestRealAccount" in the "Real Account Name" input
    And user sees "Save" button that is "enabled"
    When user clicks on the "Add credentials" button in the modal
    Then user sees "Save" button that is "disabled"


  @clearIndexedDb
  Scenario: Creating a new account. Error creating account: account already exists
    Given user goes on the "Trading Servers Manager" page with the selected "Real Accounts" tab
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user clicks on the "New Real Account" button
    And user deletes the "Credentials" params from the modal
    And user types "AutotestRealAccount" in the "Real Account Name" input
    When user clicks on the "Save" button in the "Creat Account" modal
    Then user sees the "duplicate entity AutotestRealAccount" notification message

