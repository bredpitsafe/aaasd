Feature: e2e tests: "Balance Monitor" page test suit. I as User checks the functionality of "Pump and Dump" tab

  Background:
    Given user selects the "atf-dev" server
    Then user sets the "2100" to "1400" screen size

  @clearIndexedDb
  Scenario: Checking the "Pump and Dump" table opening when clicks the "Component Statuses" button in the menu
    Given user goes to the "Balance Monitor" page with the backend server parameter
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user sees the "Balance Monitor" page
    And user closes all tabs on the "Balance Monitor" page
    When user clicks the "Pump and Dump" button in the menu "Balance Monitor"
    Then user sees the "Pump and Dump" tab in the "Balance Monitor" page
    And user sees data in the "Pump and Dump" table on the "Balance Monitor" page


  @clearIndexedDbxedDb
  Scenario: Checking the "Pump and Dump" table opening when clicks the "Component Statuses" button in the menu
    Given user goes to the "Balance Monitor" page with the backend server parameter
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user sees the "Balance Monitor" page
    And user closes all tabs on the "Balance Monitor" page
    When user clicks the "Pump and Dump" button in the menu "Balance Monitor"
    Then user sees the "Pump and Dump" tab in the "Balance Monitor" page
    And user sees data in the "Pump and Dump" table on the "Balance Monitor" page


  @clearIndexedDb
  Scenario Outline: Checking the opening when clicks the "Component Statuses" on the "<NamePage>" page
    Given user goes to the "<NamePage>" page in the "Balance Monitor"
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user sees the "<NamePage>" page of the "Balance Monitor"
    When user clicks the "Pump and Dump" button in the menu "Balance Monitor"
    Then user sees the "Pump and Dump" tab in the "Balance Monitor" page
    And user sees data in the "Pump and Dump" table on the "Balance Monitor" page

    Examples:
      | NamePage                |
      | Internal Transfers      |
      | Amount Limits Rules     |
      | Transfer Blocking Rules |
      | Auto Transfer Rules     |


  Scenario Outline: Checking the opening when clicks the "Component Statuses" on the "<NamePage>" page
    Given user goes to the "<NamePage>" page in the "Balance Monitor"
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user sees the "<NamePage>" page of the "Balance Monitor"
    When user clicks the "Pump and Dump" button in the menu "Balance Monitor"
    Then user sees the "Pump and Dump" tab in the "Balance Monitor" page
    And user sees data in the "Pump and Dump" table on the "Balance Monitor" page

    Examples:
      | NamePage                |
      | Internal Transfers      |
      | Amount Limits Rules     |
      | Transfer Blocking Rules |
      | Auto Transfer Rules     |


  @clearIndexedDb
  Scenario Outline: Checking the functionality of the filter by "<FilterName>" in the "Component Statuses" table
    Given user goes to the "Balance Monitor" page on the "Pump and Dump" tab with the backend server parameter
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user sees the "Pump & Dump" tab in the "Balance Monitor" page
    When user types "<Value>" in the input field
    Then user sees "<Value>" "<FilterName>" in the "Pump and Dump" table
    And user sees the "filter" parameter in the URL

    Examples:
      | FilterName   | Value  |
      | Coin         | AAA    |


  @clearIndexedDb
  Scenario Outline: Checking the functionality of the filter by "<FilterName>" in the "Component Statuses" table
    Given user goes to the "Balance Monitor" page on the "Pump and Dump" tab with the backend server parameter
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user sees the "Pump & Dump" tab in the "Balance Monitor" page
    When user sees a different "<FilterName>" in the context filter
    And user sets "<Value>" in the "<FilterName>" context filter
    Then user sees "<Value>" "<FilterName>" in the "Pump and Dump" table
    And user sees the "filter" parameter in the URL

    Examples:
      | FilterName      | Value  |
      | Time Interval   | 1m     |
      | Coin            | BBB    |


  @clearIndexedDb
  Scenario: Checking that there is a notice "No Rows To Show" in the "Component Statuses" table
    Given user goes to the "Balance Monitor" page on the "Pump and Dump" tab with the backend server parameter
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user sees the "Pump & Dump" tab in the "Balance Monitor" page
    When user types "X?@/Y" in the input field
    Then user sees "No Rows To Show" in the table
    And user sees the "filter" parameter in the URL

