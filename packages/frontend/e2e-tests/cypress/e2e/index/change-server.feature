Feature: e2e tests: "Stone" page test suit. I as User checks the functionality of the server change on the TSM and BM pages

  Background:
    Given user selects the "default" server

  @clearIndexedDb
  Scenario: "Herodotus Terminal" page. Checking the functionality of the server change
    Given user goes to the "Herodotus Terminal" page by index "1017"
    And user sees the "Herodotus Terminal" page
    And user sees "finished" status in the table on the "Active Tasks" tab
    When user changes the server to "qa"
    And user sees the "Authorization" page and logs in as a "Frontend" user
    Then user sees "HerodotusMulti,TestHero" in the dialog modal


  @clearIndexedDb
  Scenario: "Backtesting Manager" page. Checking the functionality of the server change
    Given user goes to the "Backtesting Manager" page with the backend server parameter
    And user sees the "Backtesting Manager" page
    When user sees "No Rows To Show" in the table
    And user changes the server to "autotest"
    And user sees the "Backtesting Manager" page
    Then user sees "Task" names in the table


  @clearIndexedDb
  Scenario: "TSM" page. "Virtual Accounts" tab. Checking the functionality of the server change
    Given user goes on the "Trading Servers Manager" page with the selected "Virtual Accounts" tab
    And user types "Account_" name in the "Virtual Accounts" input
    And user sees "Account_" names in the table
    And user changes the server to "autotest"
    And user selects the "Virtual Accounts" tab
    When user don't sees "Account_" names in the table
    And user clicks header table "ID" button
    And user don't sees "Account_" names in the table
    And user clicks header table "ID" button
    Then user don't sees "Account_" names in the table
    And user types "Account_" name in the "Virtual Accounts" input
    And user sees "No Rows To Show" in the table


  @clearIndexedDb
  Scenario: "TSM" page. "Real Accounts" tab. Checking the functionality of the server change
    Given user goes on the "Trading Servers Manager" page with the selected "Real Accounts" tab
    And user types "Account_" name in the "Real Accounts" input
    And user sees "Account_" names in the table
    And user changes the server to "autotest"
    And user selects the "Real Accounts" tab
    When user don't sees "Account_" names in the table
    And user clicks header table "ID" button
    And user don't sees "Account_" names in the table
    And user clicks header table "ID" button
    Then user don't sees "Account_" names in the table
    And user types "Account_" name in the "Real Accounts" input
    And user sees "No Rows To Show" in the table


  @clearIndexedDb
  Scenario: "TSM" page. "Real Accounts" tab. Checking the functionality of the server change
    Given user goes to the "Trading Servers Manager" page with the backend server parameter
    And user selects the "Virtual Accounts" tab
    And user clicks on the "New Virtual Account" button
    And user types random "Account" in the "Virtual Account Name" input
    And user types "AutotestRealAccount" in the "Real Accounts" input
    When user clicks on the "Save" button in the "Creat Account" modal
    And user sees the "Accounts created successfully" success message
    And user sees the inputted "User Name" in the table
    And user changes the server to "autotest"
    And user types new "User Name" in the table
    Then user sees "No Rows To Show" in the table


  @clearIndexedDb
  Scenario: "TSM" page. "Product Logs" tab. Checking the functionality of the server change
    Given user goes on the "Trading Servers Manager" page with the selected "Product Logs" tab
    And user "stops" the "TestRobotChangeServer" Robot
    When user "starts" the "TestRobotChangeServer" Robot
    And user remembers the first value in column "Message"
    And user sees value: "TestRobotChangeServer changed status:" in the "Message" column on the "Product Logs" table
    And user changes the server to "autotest"
    And user sees that the first value in column "Message" has changed
    Then user not sees value: "TestRobotChangeServer changed status:" in the "Message" column on the "Product Logs" table


  @clearIndexedDb
  Scenario: "TSM" page. "Indicators" tab. Checking the functionality of the server change
    Given user goes on the "Trading Servers Manager" page with the selected "Indicators" tab
    And user sees the "Indicators" tab
    When user remembers the first "Row" value in the "Instruments" table
    And user changes the server to "autotest"
    Then user sees that the first value in column "Row" has changed
    And user changes the server to "autocmn"
    Then user sees remembers "Name" value in the "Indicators" table