Feature: e2e tests: "Dashboard" page test suit. I as User checks the functionality import file in the "Dashboard" page

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

