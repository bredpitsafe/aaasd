Feature: e2e tests: "Dashboard" page test suit. I as User checks the functionality on the "Dashboard" page

  @clearIndexedDb
  Scenario Outline: Checking import file "<FileName>" name on the "Dashboard" page
    Given user goes to the "Dashboard" page
    And user sees the "Authorization" page and logs in as a "Frontend" user
    When user imports a file with "<FileName>" name
    And user sees a modal dialog with the name "<DashboardName>" from the file and clicks Enter
    And user sees the menu on the "Dashboard" page
    And user clicks on the "Dashboard" button in the menu
    Then user checks visibility of the "Dashboard" card with the "<DashboardName>" name

    Examples:
      | FileName                  | DashboardName             |
      | dashboard.json            | Dashboard json            |
      | chart-formula.xml         | Chart formula xml         |
      | chart-levels.xml          | Chart levels xml          |
      | chart-scheme.xml          | Chart scheme xml          |
      | chart-settings.xml        | Chart settings xml        |
      | grid-features.xml         | Grid features xml         |
      | panels-layouts.xml        | Panels layouts xml        |
      | panels-with-type.xml      | Panels with type xml      |
      | panels-without-type.xml   | Panels without type xml   |
      | table-features.xml        | Table features xml        |


  @clearIndexedDb
  Scenario Outline: Checking delete file from the "Dashboard" page by "<DashboardName>" name
    Given user goes to the "Dashboard" page
    And user sees the "Authorization" page and logs in as a "Frontend" user
    When user imports a file with "<FileName>" name
    And user sees a modal dialog with the name "<DashboardName>" from the file and clicks Enter
    And user sees the menu on the "Dashboard" page
    And user clicks on the "Dashboard" button in the menu
    And user checks visibility of the "Dashboard" card with the "<DashboardName>" name
    And user clicks on the "<DashboardName>" "Dashboard" "Delete" button
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
  Scenario: Checking the opening of the task dashboard with the "focusTo" parameter
    Given user goes to the dashboard with the "focusTo" parameter
    When user sees the "Authorization" page and logs in as a "Frontend" user
    And user sees the "Q status BN.ETH-USDC:" indicator in the "Dashboard" page
    Then user sees the correct Date parameter
