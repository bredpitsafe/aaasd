Feature: e2e tests: "TSM" page test suit. I as User checks the functionality of "Virtual Accounts" tap

  Background:
    Given user selects the "default" server

  @clearIndexedDb
  Scenario: Creating a new "Virtual Account" account with an existing "Real Account"
    Given user goes to the "Trading Servers Manager" page with the backend server parameter
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user selects the "Virtual Accounts" tab on the "Trading Servers Manager" page
    And user clicks on the "New Virtual Account" button
    And user types random "Account" in the "Virtual Account Name" input
    And user types "AutotestRealAccount" in the "Real Accounts" input
    When user clicks on the "Save" button in the "Creat Account" modal
    Then user sees the "Virtual account created successfully" success message
    And user sees the inputted "User Name" in the table
    And user checks the "Real Account" name


  @clearIndexedDb
  Scenario: Creating a new "Virtual Account" and connection for new "Real Account"
    Given user goes on the "Trading Servers Manager" page with the selected "Real Accounts" tab
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user created random "Real Account" fo "AutotestForVirtualAccount" name
    And user selects the "Virtual Accounts" tab on the "Trading Servers Manager" page
    And user clicks on the "New Virtual Account" button
    And user types random "Account" in the "Virtual Account Name" input
    And user selects new created "Account" in the "Real Accounts" section
    When user clicks on the "Save" button in the "Creat Account" modal
    Then user sees the "Virtual account created successfully" success message
    And user checks inputted "RealAccountName" and "VirtualAccountName" names


  @clearIndexedDb
  Scenario: Checking create and edit of a new "Virtual Account"
    Given user goes on the "Trading Servers Manager" page with the selected "Real Accounts" tab
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user created random "Real Account" fo "AutotestForVirtualAccount" name
    And user created second random "Real Account" fo "AutotestEditForVirtualAccount" name
    And user selects the "Virtual Accounts" tab on the "Trading Servers Manager" page
    And user clicks on the "New Virtual Account" button
    And user types random "Account" in the "Virtual Account Name" input
    And user selects new created "Account" in the "Real Accounts" section
    And user clicks on the "Save" button in the "Creat Account" modal
    And user sees the "Virtual account created successfully" success message
    And user opens the "Virtual Accounts" and "Real Accounts" modal and edits name
    And user deletes "AutotestForVirtualAccount" "Real Account" and selects "AutotestEditForVirtualAccount" "Real Account"
    When user clicks on the "Save" button in the "Creat Account" modal
    And user sees the "Virtual account updated successfully" success message
    Then user checks inputted "RealAccountName" and "VirtualAccountName" names


  @clearIndexedDb
  Scenario: Creating a new "Virtual Account" and connection a two new "Real Account"
    Given user goes on the "Trading Servers Manager" page with the selected "Real Accounts" tab
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user created random "Real Account" fo "AutotestOneForVirtualAccount" name
    And user created second random "Real Account" fo "AutotestTwoForVirtualAccount" name
    And user selects the "Virtual Accounts" tab on the "Trading Servers Manager" page
    And user clicks on the "New Virtual Account" button
    And user types random "Account" in the "Virtual Account Name" input
    And user selects two "AutotestRealAccountName" in the "Real Accounts" section
    When user clicks on the "Save" button in the "Creat Account" modal
    And user sees the "Virtual account created successfully" success message
    Then user checks selects two "Real Accounts" names