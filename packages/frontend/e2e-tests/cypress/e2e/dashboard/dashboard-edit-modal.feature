Feature: e2e tests: "Dashboard" page test suit. I as User checks the functionality "Edit Dashboard" in the "Dashboard" page

  @clearIndexedDb
  Scenario: Checking the functionality of the "Close" button in the "Edit Dashboard" modal
    Given user goes to the "Dashboard" page at link by id "163b22b6-7e72-460e-b480-48da53088c3c"
    And user sees the "Authorization" page and logs in as a "Frontend" user
    When user clicks on the "Edit Dashboard" button menu on the "Dashboard" page
    And user sees the "Dashboard ForTestsEditModal" modal
    When user clicks on the "Close" button in the "Dashboard Edit" modal
    Then user not sees the "Dashboard ForTestsEditModal" modal


  @clearIndexedDb
  Scenario Outline: Checking visibility a "Edit Dashboard" modal with "<NameDashboard>" panel dashboard
    Given user goes to the "Dashboard" page
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user sees the "Select dashboard" label in the "Dashboard" page
    And user sees the "Choose dashboard" menu in the "Dashboard" page
    And user deletes all "New Dashboard" the "Choose dashboard" menu in the "Dashboard" page
    When user clicks on the "Add" button in the "Choose dashboard" menu
    And user clicks on the "Add Panel" button and selects "<NameDashboard>" in the menu "Dashboard" page
    When user clicks on the "Edit Dashboard" button menu on the "Dashboard" page
    Then user sees the "Edit Dashboard" modal a "<NameDashboard>" panel dashboard

    Examples:
      | NameDashboard |
      | Chart         |
      | Table         |
      | Grid          |


  @clearIndexedDb
  Scenario: Checking selects "Charts" and "Config" forms in the "Edit Dashboard" modal
    Given user goes to the "Dashboard" page at link by id "fa969575-0f08-4a43-926b-3598b9be299d"
    And user sees the "Authorization" page and logs in as a "Frontend" user
    When user clicks on the "Edit Dashboard" button menu on the "Dashboard" page
    And user selects the "Charts" form in the "Edit Dashboard" modal
    When user sees the "Charts" form in the "Edit Dashboard" modal
    And user selects the "Config" form in the "Edit Dashboard" modal
    Then user sees the "Config" form in the "Edit Dashboard" modal


  @clearIndexedDb
  Scenario: Check functionality "Discard" button in the "Config" form in the "Edit Dashboard" modal
    Given user goes to the "Dashboard" page at link by id "fa969575-0f08-4a43-926b-3598b9be299d"
    And user sees the "Authorization" page and logs in as a "Frontend" user
    When user clicks on the "Edit Dashboard" button menu on the "Dashboard" page
    And user not sees the active elements in the "Config" form
    When user types a random value in the "Config" input in the "Edit Dashboard" modal
    And user sees the typed random value in the "Config" form
    And user sees the active elements in the "Config" form
    When user clicks on the "Discard" button in the "Config" form
    And user not sees the typed random value in the "Config" form
    Then user not sees the active elements in the "Config" form


  @clearIndexedDb
  Scenario: Check functionality "Diff" switch button in the "Config" form in the "Edit Dashboard" modal
    Given user goes to the "Dashboard" page at link by id "fa969575-0f08-4a43-926b-3598b9be299d"
    And user sees the "Authorization" page and logs in as a "Frontend" user
    When user clicks on the "Edit Dashboard" button menu on the "Dashboard" page
    And user not sees the active elements in the "Config" form
    When user types a random value in the "Config" input in the "Edit Dashboard" modal
    When user clicks on the "Diff" switch button in the "Config" form
    And user sees the types random value in the "Edited config" form
    Then user not sees the types random value in the "Server config" form


  @clearIndexedDb
  Scenario: Check functionality "Discard" button in the "Chart" form in the "Edit Dashboard" modal
    Given user goes to the "Dashboard" page
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user sees the "Select dashboard" label in the "Dashboard" page
    And user sees the "Choose dashboard" menu in the "Dashboard" page
    And user deletes all "New Dashboard" the "Choose dashboard" menu in the "Dashboard" page
    And user clicks on the "Add" button in the "Choose dashboard" menu
    And user clicks on the "Add Panel" button and selects "Chart" in the menu "Dashboard" page
    When user clicks on the "Edit Dashboard" button menu on the "Dashboard" page
    And user selects the "Charts" form in the "Edit Dashboard" modal
    And user not sees the active elements in the "Charts" form
    When user clicks on the "Add Panel" button in the "Charts" form
    And user sees a new panel in the "Charts" form in the "Edit Dashboard" modal
    And user sees the active elements in the "Charts" form
    When user clicks on the "Discard" button in the "Charts" form
    And user not sees a new panel in the "Charts" form in the "Edit Dashboard" modal
    Then user not sees the active elements in the "Charts" form


  @clearIndexedDb
  Scenario Outline: Checking "<NameDashboard>" "Dashboard" editing using a "Config" form in the "Edit Dashboard" modal
    Given user goes to the "Dashboard" page at link by id "163b22b6-7e72-460e-b480-48da53088c3c"
    And user sees the "Authorization" page and logs in as a "Frontend" user
    When user clicks on the "Edit Dashboard" button menu on the "Dashboard" page
    And user types a "<NameFile>" config in the "Config" input in the "Edit Dashboard" modal
    When user clicks on the "Apply" button in the "Config" form
    And user not sees the active elements in the "Config" form
    When user clicks on the "Close" button in the "Change dashboard permissions" modal
    Then user sees a new "<NameDashboard>" layout on the "Dashboard" page

    Examples:
      | NameFile                 | NameDashboard |
      | New Dashboard-table.xml  | Table         |
      | New Dashboard-grid.xml   | Grid          |
      | New Dashboard-chart.xml  | Edit Chart    |


  @clearIndexedDb
  Scenario: Checking "Chart" "Dashboard" editing using a "Chart" form in the "Edit Dashboard" modal
    Given user goes to the "Dashboard" page
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user sees the "Select dashboard" label in the "Dashboard" page
    And user sees the "Choose dashboard" menu in the "Dashboard" page
    And user deletes all "New Dashboard" the "Choose dashboard" menu in the "Dashboard" page
    And user clicks on the "Add" button in the "Choose dashboard" menu
    And user clicks on the "Add Panel" button and selects "Chart" in the menu "Dashboard" page
    When user clicks on the "Edit Dashboard" button menu on the "Dashboard" page
    And user selects the "Charts" form in the "Edit Dashboard" modal
    And user not sees the active elements in the "Charts" form
    And user clicks on the "Add Panel" button in the "Charts" form
    When user types a "indicators{name='BTCUSDT|Binance.l1.ask.rep.0.1'}" value in the "Panel" in the "Charts" form
    And user clicks on the "Apply" button in the "Charts" form
    When user clicks on the "Close" button in the "Change dashboard permissions" modal
    Then user sees a new "Edit Chart" layout on the "Dashboard" page

