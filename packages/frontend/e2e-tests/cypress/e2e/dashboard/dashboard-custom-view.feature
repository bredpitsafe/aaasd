Feature: e2e tests: "Dashboard" page test suit. I as User checks the functionality "Custom View"

  @clearIndexedDb
  Scenario: Checking the loading of the indicator table
    Given user goes to the "Dashboard" page at link by id "413136c1-f770-444f-9c59-5a81ad3613bf"
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user sees the menu on the "Dashboard" page
    And user sees "Loading Table configuration" text on the "Dashboard" page
    When user sees the name of the columns in the table
    Then user sees indicators and colored rows


  @clearIndexedDb
  Scenario: Checking the loading of values in the grid
    Given user goes to the "Dashboard" page at link by id "6dbd303f-47bf-4c06-a571-46b154fccb15"
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user sees the menu on the "Dashboard" page
    When user sees "Loading Table configuration" text on the "Dashboard" page
    Then user sees the value of the columns in the grid


  @clearIndexedDb
  Scenario Outline: Checking the visibility of the "<CustomViewName>" panel
    Given user goes to the "Dashboard" page at link by id "d2ff75e7-084c-41cf-bc64-ee0adce56c23"
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user sees the menu on the "Dashboard" page
    And user selects the "Config" of the panel
    And user types a "<FileName>" into the field
    When user clicks a Apply button
    And user selects the "View" of the panel
    Then user sees data "<CustomViewName>" panel on the "Dashboard" page


    Examples:
      | FileName              | CustomViewName    |
      | custom-view-grid.xml  | Grid Custom View  |
      | custom-view-table.xml | Table Custom View |

