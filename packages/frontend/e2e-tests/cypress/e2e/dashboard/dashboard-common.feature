Feature: e2e tests: "Dashboard" page test suit. I as User checks the functionality on the "Dashboard" page

  @clearIndexedDb
  Scenario Outline: Checking delete file from the "Dashboard" page by "<DashboardName>" name
    Given user goes to the "Dashboard" page
    And user sees the "Authorization" page and logs in as a "Frontend" user
    When user imports a file with "<FileName>" name
    And user sees a modal dialog with the name "<DashboardName>" from the file and clicks Enter
    And user sees the menu on the "Dashboard" page
    And user clicks on the "Dashboard" button in the menu
    And user checks visibility of the "Dashboard" card with the "<DashboardName>" name
    And user selects "Delete Dashboard" in the context menu from the "<DashboardName>"
    Then user sees the "Dashboard" page

    Examples:
      | FileName                  | DashboardName             |
      | dashboard.json            | Dashboard json            |


  @clearIndexedDb
  Scenario Outline: Checking visibly the "<NameDashboard>" "Dashboard" page
    Given user goes to the "Dashboard" page from "<NameDashboard>"
    When user sees the "Authorization" page and logs in as a "Frontend" user
    And user sees the menu on the "Dashboard" page
    Then user sees labels and headers "<NameDashboard>" "Dashboard"

    Examples:
      | NameDashboard       |
      | RobotDashboard      |
      | Indicators          |
      | RobotTaskDashboard  |


  @clearIndexedDb
  Scenario Outline: Checking the opening of the task dashboard with id "<Id>"
    Given user goes to the "Dashboard" page of the task with id "<Id>"
    When user sees the "Authorization" page and logs in as a "Frontend" user
    And user sees the menu on the "Dashboard" page
    Then user sees the task legend with id "<Id>"

    Examples:
      | Id      |
      | 71      |
      | 158     |


  @clearIndexedDb
  Scenario: Checking the loading of the indicator table
    Given user goes to the "Dashboard" page at link by id "413136c1-f770-444f-9c59-5a81ad3613bf"
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user sees the menu on the "Dashboard" page
    And user sees "Loading Table configuration" text on the "Dashboard" page
    When user sees the name of the columns in the table
    And user waits for "15" seconds
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
    Given user goes to the "Dashboard" page at link by id "26b962f1-e9a0-4914-a35b-46aa035cbe31"
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user sees the menu on the "Dashboard" page
    And user selects the "Config" of the panel
    And user types a "<FileName>" into the field
    When user clicks on the "Apply" button in the "Config" form
    And user selects the "View" of the panel
    Then user sees data "<CustomViewName>" panel on the "Dashboard" page

    Examples:
      | FileName              | CustomViewName    |
      | custom-view-table.xml | Table Custom View |
      | custom-view-grid.xml  | Grid Custom View  |


  @clearIndexedDb
  Scenario: Checking the opening of the task dashboard with the "focusTo" parameter
    Given user goes to the dashboard with the "focusTo" parameter
    When user sees the "Authorization" page and logs in as a "Frontend" user
    And user sees the "Q status BN.BTC-USDT:" indicator in the "Dashboard" page
    Then user sees the correct Date parameter

