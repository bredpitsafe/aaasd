Feature: e2e tests: "Balance Monitor" page test suit. I as User checks the functionality of "Balance Monitor" page

  Background:
    Given user selects the "atf-dev" server
    Then user sets the "2100" to "1400" screen size

  @clearIndexedDb
  Scenario: Checking sets a "AAA" filter in the "Distribution" tab with standard settings
    Given user goes to the "Balance Monitor" page with the backend server parameter
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user sees the "Balance Monitor" page
    And user reset coins in the "coin filter" setting
    And user sets the "Distribution" in the "coin filter" setting
    When user select "AAA" in the coin filter in the "Balance Monitor" page
    And user sees different coins in the "Suggested Transfers" table
    And user sees different coins in the "Transfers History" table
    Then user sees the selected coin "AAA" in the "Distribution" tab


  @clearIndexedDbx
  Scenario: Checking sets a "WBN" filter with the "Transfers History" tab setting only
    Given user goes to the "Balance Monitor" page with the backend server parameter
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user sees the "Balance Monitor" page
    And user reset coins in the "coin filter" setting
    And user sets the "Transfers History" in the "coin filter" setting
    When user select "WBN" in the coin filter in the "Balance Monitor" page
    And user sees "Coin not selected" in the "Distribution" tab
    And user sees different coins in the "Suggested Transfers" table
    Then user sees the selected coin "WBN" in the "Transfers History" tab


  @clearIndexedDb
  Scenario: Checking sets a "ZZZ" filter with the "Suggested Transfers" tab setting only
    Given user goes to the "Balance Monitor" page with the backend server parameter
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user sees the "Balance Monitor" page
    And user reset coins in the "coin filter" setting
    And user sets the "Suggested Transfers" in the "coin filter" setting
    When user select "ZZZ" in the coin filter in the "Balance Monitor" page
    And user sees "Coin not selected" in the "Distribution" tab
    And user sees different coins in the "Transfers History" table
    Then user sees the selected coin "ZZZ" in the "Suggested Transfers" tab


  @clearIndexedDb
  Scenario: Checking sets a "WBN" filter with the "Suggested Transfers, Transfers History" tabs setting
    Given user goes to the "Balance Monitor" page with the backend server parameter
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user sees the "Balance Monitor" page
    And user reset coins in the "coin filter" setting
    And user sets the "Suggested Transfers,Transfers History" in the "coin filter" setting
    When user select "WBN" in the coin filter in the "Balance Monitor" page
    And user sees "Coin not selected" in the "Distribution" tab
    When user sees the selected coin "WBN" in the "Suggested Transfers" tab
    Then user sees the selected coin "WBN" in the "Transfers History" tab


  @clearIndexedDb
  Scenario: Checking sets a "WBN" filter with the "Distribution, Transfers History" tabs setting
    Given user goes to the "Balance Monitor" page with the backend server parameter
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user sees the "Balance Monitor" page
    And user reset coins in the "coin filter" setting
    And user sets the "Transfers History,Distribution" in the "coin filter" setting
    When user select "WBN" in the coin filter in the "Balance Monitor" page
    And user sees different coins in the "Suggested Transfers" table
    When user sees the selected coin "WBN" in the "Distribution" tab
    Then user sees the selected coin "WBN" in the "Transfers History" tab


  @clearIndexedDb
  Scenario: Checking sets a "ZZZ" filter with the "Distribution, Suggested Transfers" tabs setting
    Given user goes to the "Balance Monitor" page with the backend server parameter
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user sees the "Balance Monitor" page
    And user reset coins in the "coin filter" setting
    And user sets the "Suggested Transfers,Distribution" in the "coin filter" setting
    When user select "WBN" in the coin filter in the "Balance Monitor" page
    And user sees different coins in the "Transfers History" table
    When user sees the selected coin "WBN" in the "Distribution" tab
    Then user sees the selected coin "WBN" in the "Suggested Transfers" tab


  @clearIndexedDb
  Scenario: Checking sets a "AAA" filter with the "Distribution, Suggested Transfers, Transfers History" tabs setting
    Given user goes to the "Balance Monitor" page with the backend server parameter
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user sees the "Balance Monitor" page
    And user reset coins in the "coin filter" setting
    And user sets the "Suggested Transfers,Transfers History,Distribution" in the "coin filter" setting
    When user select "AAA" in the coin filter in the "Balance Monitor" page
    When user sees the selected coin "AAA" in the "Distribution" tab
    When user sees the selected coin "AAA" in the "Suggested Transfers" tab
    Then user sees the selected coin "AAA" in the "Transfers History" tab


  @clearIndexedDb
  Scenario: Checking the coin selection in the "Distribution" tab and sets in the "Suggested Transfers, Transfers History" tabs
    Given user goes to the "Balance Monitor" page with the backend server parameter
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user sees the "Balance Monitor" page
    And user reset coins in the "coin filter" setting
    And user sets the "Suggested Transfers,Transfers History,Distribution" in the "coin filter" setting
    When user selects a coin "WBN" in the "Distribution" tab
    And user sees the selected coin "WBN" in the "Distribution" tab
    And user sees the selected coin "WBN" in the "Suggested Transfers" tab
    And user sees the selected coin "WBN" in the "Transfers History" tab
    When user clears "WBN" the input in the "Distribution" tab
    And user sees different coins in the "Suggested Transfers" table
    And user sees different coins in the "Transfers History" table
    Then user sees "Coin not selected" in the "Distribution" tab


  @clearIndexedDb
  Scenario: Checking the coin selection in the "Suggested Transfers" tab and sets in the "Distribution, Transfers History" tabs
    Given user goes to the "Balance Monitor" page with the backend server parameter
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user sees the "Balance Monitor" page
    And user reset coins in the "coin filter" setting
    And user sets the "Suggested Transfers,Transfers History,Distribution" in the "coin filter" setting
    When user clicks the first "AAA" coin in the "Suggested Transfers" table
    And user sees the selected coin "AAA" in the "Distribution" tab
    And user sees the selected coin "AAA" in the "Suggested Transfers" tab
    And user sees the selected coin "AAA" in the "Transfers History" tab
    When user clicks the first "AAA" coin in the "Suggested Transfers" table
    And user sees "Coin not selected" in the "Distribution" tab
    And user sees different coins in the "Transfers History" table
    Then user sees different coins in the "Suggested Transfers" table


  @clearIndexedDb
  Scenario: Checking the coin selection in the "Transfers History" tab and sets in the "Distribution, Suggested Transfers" tabs
    Given user goes to the "Balance Monitor" page with the backend server parameter
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user sees the "Balance Monitor" page
    And user reset coins in the "coin filter" setting
    And user sets the "Suggested Transfers,Transfers History,Distribution" in the "coin filter" setting
    When user clicks the first "WBN" coin in the "Transfers History" table
    And user sees the selected coin "WBN" in the "Distribution" tab
    And user sees the selected coin "WBN" in the "Suggested Transfers" tab
    And user sees the selected coin "WBN" in the "Transfers History" tab
    When user clicks the first "WBN" coin in the "Transfers History" table
    And user sees "Coin not selected" in the "Distribution" tab
    And user sees different coins in the "Suggested Transfers" table
    Then user sees different coins in the "Transfers History" table


  @clearIndexedDb
  Scenario: Checking sets coin in the "Suggested Transfers" tab and reset coin in the "Transfers History" tab
    Given user goes to the "Balance Monitor" page with the backend server parameter
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user sees the "Balance Monitor" page
    And user reset coins in the "coin filter" setting
    And user sets the "Suggested Transfers,Transfers History,Distribution" in the "coin filter" setting
    When user clicks the first "AAA" coin in the "Suggested Transfers" table
    And user sees the selected coin "AAA" in the "Distribution" tab
    And user sees the selected coin "AAA" in the "Suggested Transfers" tab
    And user sees the selected coin "AAA" in the "Transfers History" tab
    When user clicks the first "AAA" coin in the "Transfers History" table
    And user sees "Coin not selected" in the "Distribution" tab
    And user sees different coins in the "Suggested Transfers" table
    Then user sees different coins in the "Transfers History" table


  @clearIndexedDb
  Scenario: Checking sets coin in the "Transfers History" tab and reset coin in the "Suggested Transfers" tab
    Given user goes to the "Balance Monitor" page with the backend server parameter
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user sees the "Balance Monitor" page
    And user reset coins in the "coin filter" setting
    And user sets the "Suggested Transfers,Transfers History,Distribution" in the "coin filter" setting
    When user clicks the first "WBN" coin in the "Transfers History" table
    And user sees the selected coin "WBN" in the "Distribution" tab
    And user sees the selected coin "WBN" in the "Suggested Transfers" tab
    And user sees the selected coin "WBN" in the "Transfers History" tab
    When user clicks the first "WBN" coin in the "Suggested Transfers" table
    And user sees "Coin not selected" in the "Distribution" tab
    And user sees different coins in the "Suggested Transfers" table
    Then user sees different coins in the "Transfers History" table

