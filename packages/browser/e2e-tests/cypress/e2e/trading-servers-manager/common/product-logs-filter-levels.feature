Feature: e2e tests: "TSM" page test suit. I as a user check the function of "Level" filters of "Product Logs" tab

  Background:
    Given user selects the "default" server

  @clearIndexedDb
  Scenario Outline: Checking the selection of "<LevelName>" from the "Level" filter
    Given user goes on the "Trading Servers Manager" page with the selected "Product Logs" tab
    And user opens the "Server Filter" panel
    And user clears the "Level" filters
    When user selects "<LevelName>" from the "Level" filter
    Then user sees the logs with "<LevelName>" level filter in the table

    Examples:
      | LevelName  |
      | Info       |
      | Warn       |
      | Error      |


  @clearIndexedDb
  Scenario: Checking of sequential search by three filters
    Given user goes on the "Trading Servers Manager" page with the selected "Product Logs" tab
    And user opens the "Server Filter" panel
    And user clears the "Level" filters
    And user selects "Error" from the "Level" filter
    And user sees the logs with "Error" level filter in the table
    And user clears the "Error" "Level" filter
    When user selects "Info" from the "Level" filter
    Then user sees the logs with "Info" level filter in the table
    And user clears the "Info" "Level" filter
    When user selects "Warn" from the "Level" filter
    Then user sees the logs with "Warn" level filter in the table


  @clearIndexedDb
  Scenario: Checking that the value comes after empty rows
    Given user goes on the "Trading Servers Manager" page with the selected "Product Logs" tab
    And user opens the "Server Filter" panel
    And user sets the date "2023-09-04 00:00:00" and "2023-09-05 00:00:00" in the calendar
    And user clears the "Level" filters
    And user selects "Warn" from the "Level" filter
    And user sees "No Rows To Show" in the table
    And user sets the date "2024-01-01 00:00:00" and "2024-02-29 00:00:00" in the calendar
    And user clears the "Warn" "Level" filter
    When user selects "Info" from the "Level" filter
    And user sees the set date "2024-01-01 00:00:00" and "2024-02-29 00:00:00" in the "Time UTC" column
    Then user sees the logs with "Info" level filter in the table