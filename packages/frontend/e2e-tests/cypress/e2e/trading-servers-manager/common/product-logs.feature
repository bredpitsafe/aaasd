Feature: e2e tests: "TSM" page test suit. I as a user check the common functionality of "Product Logs" tab

  Background:
    Given user selects the "default" server

  @clearIndexedDb
  Scenario: Checking the selection of the "Product Logs" tab
    Given user goes to the "Trading Servers Manager" page with the backend server parameter
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user sees the name "Servers" in the header
    When user selects the "Product Logs" tab on the "Trading Servers Manager" page
    Then user sees the "Product Logs" tab in the "Trading Servers Manager" page


  @clearIndexedDb
  Scenario: Checking the opening closing of the "Server Filter" panel
    Given user goes on the "Trading Servers Manager" page with the selected "Product Logs" tab
    And user sees the "Authorization" page and logs in as a "Frontend" user
    When user clicks "Server Filter" button And sees the "Server Filter" panel
    Then user clicks "Server Filter" button And not sees the "Server Filter" panel


  @clearIndexedDb
  Scenario: Checking for deletion and addition "Level" filters
    Given user goes on the "Trading Servers Manager" page with the selected "Product Logs" tab
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user opens the "Server Filter" panel
    And user sees the "Level" filter
    When user deletes "Level" filters And checks the deletion "Level" filters
    Then user adds "Level" filters And checks the addition "Level" filters


  @clearIndexedDb
  Scenario: Checking the opening of the header menu in the table
    Given user goes on the "Trading Servers Manager" page with the selected "Product Logs" tab
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user opens the "Server Filter" panel
    When user opens the header menu
    Then user sees the header menu


  @clearIndexedDb
  Scenario: Checking tabs in the header menu in the table
    Given user goes on the "Trading Servers Manager" page with the selected "Product Logs" tab
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user opens the "Server Filter" panel
    When user opens the header menu
    Then user checks the selection of tabs in the header menu


  @clearIndexedDb
  Scenario Outline: Checking the addition of a "<HeaderName>" column in the table head
    Given user goes on the "Trading Servers Manager" page with the selected "Product Logs" tab
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user opens the "Server Filter" panel
    When user opens the header menu And selects the "<HeaderName>" column in the menu
    Then user sees a new column "<HeaderName>" in the table

    Examples:
      | HeaderName   |
      | Actor Key    |
      | Actor Group  |


  @clearIndexedDb
  Scenario: Checking data creation after page reloading
    Given user goes on the "Trading Servers Manager" page with the selected "Product Logs" tab
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user opens the "Server Filter" panel
    And user sets the date "2024-07-01 00:00:00" and "2024-07-30 00:00:00" in the calendar
    And user select column by "Time,Message" name
    When user types "Account_" in the "Message" input of the filter "Include"
    And user sees inputted "Account" in the "Message" column
    And user sees the set date "2024-07-01 00:00:00" and "2024-07-30 00:00:00" in the "Time UTC" column
    And user reload a page
    And user opens the "Server Filter" panel
    When user sees set the data "2024-07-01 00:00:00" and "2024-07-30 00:00:00" in the calendar
    And user sees types "Account_" in the "Message" input of the filter "Include"
    And user sees inputted "Account_" in the "Message" column
    Then user sees the set date "2024-07-01 00:00:00" and "2024-07-30 00:00:00" in the "Time UTC" column


  @clearIndexedDb
  Scenario: Checking that the value comes after empty rows
    Given user goes on the "Trading Servers Manager" page with the selected "Product Logs" tab
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user opens the "Server Filter" panel
    And user sets the date "2023-09-04 00:00:00" and "2023-09-05 00:00:00" in the calendar
    And user clears the "Level" filters
    And user selects "Warn" from the "Level" filter
    And user sees "No Rows To Show" in the table
    And user sets the date "2024-07-01 00:05:00" and "2024-07-01 00:05:05" in the calendar
    And user clears the "Warn" "Level" filter
    When user selects "Info" from the "Level" filter
    And user sees the set date "2024-07-01 00:05:00" and "2024-07-01 00:05:05" in the "Time UTC" column
    Then user sees the logs with "Info" level filter in the table


  @clearIndexedDb
  Scenario Outline: Checking the functionality of "<NameButton>" button
    Given user goes on the "Trading Servers Manager" page with the selected "Product Logs" tab
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user opens the "Server Filter" panel
    And user sets the date "2024-07-01 00:05:00" and "2024-07-01 00:15:15" in the calendar
    When user types "test_md_indicator.TestMdIndicator" in the "Message" input of the filter "Include"
    And user clicks on the "Apply" button in the filter
    And user clicks the "test_md_indicator.TestMdIndicator" component in the table
    When user clicks on the "<NameButton>" button
    Then user sees the "<SuccessMessage>" success message
    And user checks the downloaded file with file "<NameFile>"

    Examples:
      | NameButton | SuccessMessage                           | NameFile                       |
      | CSV        | 1 table rows copied to clipboard as CSV  | product-logs/product-logs.csv  |
      | TSV        | 1 table rows copied to clipboard as TSV  | product-logs/product-logs.tsv  |
      | JSON       | 1 table rows copied to clipboard as JSON | product-logs/product-logs.json |


  @clearIndexedDb
  Scenario Outline: Checking the row download by "<NameExport>" button
    Given user goes on the "Trading Servers Manager" page with the selected "Product Logs" tab
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user opens the "Server Filter" panel
    And user sets the date "2024-07-01 00:05:00" and "2024-07-01 00:15:15" in the calendar
    When user types "test_md_indicator.TestMdIndicator" in the "Message" input of the filter "Include"
    And user clicks on the "Apply" button in the filter
    Then user clicks the "test_md_indicator.TestMdIndicator" component in the table and selects context menu of "Export" and "<NameExport>"
    And user checks the downloaded "<NameDownloadedFile>" file with file "<NameFile>"

    Examples:
      | NameExport    | NameFile                 | NameDownloadedFile            |
      | CSV Export    | product-logs/export.csv  | cypress/downloads/export.csv  |
      | Excel Export  | product-logs/export.xlsx | cypress/downloads/export.xlsx |