Feature: e2e tests: "Dashboard" page test suit. I as User checks the functionality "Menu" in the "Dashboard" page

  @clearIndexedDb
  Scenario: Checking the functionality of the "Set Layout" button in the menu
    Given user goes to the "Dashboard" page
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user sees that all buttons are disabled in the menu
    And user deletes all "New Dashboard" the "Choose dashboard" menu in the "Dashboard" page
    And user clicks on the "Add" button in the "Choose dashboard" menu
    When user clicks on the "Add Panel" button and selects "Chart" in the menu "Dashboard" page
    And user clicks on the "Set Layout" button menu on the "Dashboard" page
    Then user sees a "Set Layout" popover on the "Dashboard" page


  @clearIndexedDb
  Scenario Outline: Checking the functionality of the "Add Panel" button and selects "<NamePanel>" dashboard in the menu
    Given user goes to the "Dashboard" page
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user sees the "Select dashboard" label in the "Dashboard" page
    And user sees the "Choose dashboard" menu in the "Dashboard" page
    And user deletes all "New Dashboard" the "Choose dashboard" menu in the "Dashboard" page
    And user clicks on the "Add" button in the "Choose dashboard" menu
    And user sees the "Dashboard is empty" label in the "Dashboard" page
    When user clicks on the "Add Panel" button and selects "<NamePanel>" in the menu "Dashboard" page
    And user sees the "Panel added" success message
    Then user sees a new "<NamePanel>" layout on the "Dashboard" page

    Examples:
      | NamePanel |
      | Chart     |
      | Table     |
      | Grid      |


  @clearIndexedDb
  Scenario Outline: Checking the functionality of the "<NameButton>" button in the menu
    Given user goes to the "Dashboard" page
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user sees the "Select dashboard" label in the "Dashboard" page
    And user sees the "Choose dashboard" menu in the "Dashboard" page
    And user deletes all "New Dashboard" the "Choose dashboard" menu in the "Dashboard" page
    And user clicks on the "Add" button in the "Choose dashboard" menu
    When user clicks on the "<NameButton>" button menu on the "Dashboard" page
    Then user sees the "<NameModal>" modal

    Examples:
      | NameButton      | NameModal                    |
      | Edit Dashboard  | Dashboard New Dashboard      |
      | Share Dashboard | Change dashboard permissions |


  @clearIndexedDb
  Scenario: Checking the functionality of the "Save Changes" button in the menu
    Given user goes to the "Dashboard" page
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user sees that all buttons are disabled in the menu
    And user deletes all "New Dashboard" the "Choose dashboard" menu in the "Dashboard" page
    And user clicks on the "Add" button in the "Choose dashboard" menu
    And user sees that "Save Changes" and "Revert Changes" buttons are disabled in the menu
    When user clicks on the "Add Panel" button and selects "Chart" in the menu "Dashboard" page
    And user sees the "Panel added" success message
    And user sees that all buttons are enabled in the menu
    When user clicks on the "Save Changes" button menu on the "Dashboard" page
    And user sees the "Dashboard saved" success message
    Then user sees that "Save Changes" and "Revert Changes" buttons are disabled in the menu


  @clearIndexedDb
  Scenario: Checking the functionality of the "Revert Changes" button in the menu
    Given user goes to the "Dashboard" page
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user sees that all buttons are disabled in the menu
    And user deletes all "New Dashboard" the "Choose dashboard" menu in the "Dashboard" page
    And user clicks on the "Add" button in the "Choose dashboard" menu
    And user sees that "Save Changes" and "Revert Changes" buttons are disabled in the menu
    When user clicks on the "Add Panel" button and selects "Chart" in the menu "Dashboard" page
    And user sees the "Panel added" success message
    And user sees that all buttons are enabled in the menu
    When user clicks on the "Revert Changes" button menu on the "Dashboard" page
    And user sees the "Dashboard reverted" success message
    And user sees that "Save Changes" and "Revert Changes" buttons are disabled in the menu
    Then user sees the "Dashboard is empty" label in the "Dashboard" page


  @clearIndexedDb
  Scenario: Checking the functionality of the "Export and Clone" button and selects "Export dashboard" in the menu
    Given user goes to the "Dashboard" page
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user sees the "Choose dashboard" menu in the "Dashboard" page
    And user deletes all "New Dashboard" the "Choose dashboard" menu in the "Dashboard" page
    And user clicks on the "Add" button in the "Choose dashboard" menu
    When user clicks on the "Export and Clone" button and selects "Clone dashboard" in the menu "Dashboard" page
    Then user sees the "Clone dashboard" modal


  @clearIndexedDb
  Scenario: Checking the functionality of the "Export and Clone" button and selects "Clone dashboard" in the menu
    Given user goes to the "Dashboard" page
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user sees the "Choose dashboard" menu in the "Dashboard" page
    And user deletes all "New Dashboard" the "Choose dashboard" menu in the "Dashboard" page
    And user clicks on the "Add" button in the "Choose dashboard" menu
    When user clicks on the "Export and Clone" button and selects "Export dashboard" in the menu "Dashboard" page
    Then user checks the downloaded "cypress/downloads/New Dashboard.xml" file with file "dashboard/New Dashboard.xml"


  @clearIndexedDb
  Scenario Outline: Checking the functionality of the "Compact Mode" button in the menu with "<NameDashboard>" dashboard
    Given user goes to the "Dashboard" page
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user sees the "Select dashboard" label in the "Dashboard" page
    And user sees the "Choose dashboard" menu in the "Dashboard" page
    And user deletes all "New Dashboard" the "Choose dashboard" menu in the "Dashboard" page
    And user clicks on the "Add" button in the "Choose dashboard" menu
    When user clicks on the "Add Panel" button and selects "<NameDashboard>" in the menu "Dashboard" page
    And user sees the "Panel added" success message
    When user clicks on the "Compact Mode" button menu on the "Dashboard" page
    Then user not sees "Panel Dashboard" menu on the "<NameDashboard>" dashboard

    Examples:
      | NameDashboard |
      | Chart         |
      | Table         |
      | Grid          |


  @clearIndexedDb
  Scenario: Checking the functionality of the "Sync Mode" button in the menu
    Given user goes to the "Dashboard" page
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user sees the "Select dashboard" label in the "Dashboard" page
    And user sees the "Choose dashboard" menu in the "Dashboard" page
    And user deletes all "New Dashboard" the "Choose dashboard" menu in the "Dashboard" page
    And user clicks on the "Add" button in the "Choose dashboard" menu
    When user clicks on the "Add Panel" button and selects "Chart" in the menu "Dashboard" page
    And user sees the "Panel added" success message
    When user clicks on the "Sync Mode" button menu on the "Dashboard" page
    Then user sees an indicator that the "Sync Mode" is on


  @clearIndexedDb
  Scenario: Checking the functionality of the "Import Dashboard" button in the menu
    Given user goes to the "Dashboard" page
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user sees the "Select dashboard" label in the "Dashboard" page
    When user clicks on the "Import Dashboard" button menu on the "Dashboard" page and selects "New Dashboard.xml" file
    Then user sees the "Add dashboard" modal


  @clearIndexedDb
  Scenario: Checking the functionality of the "Select Dashboard" button in the menu for a new "Dashboard"
    Given user goes to the "Dashboard" page
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user sees the "Select dashboard" label in the "Dashboard" page
    And user sees the "Choose dashboard" menu in the "Dashboard" page
    And checks that the "Choose dashboard" menu cannot be hidden
    When user clicks on the "Add" button in the "Choose dashboard" menu
    And user not sees the "Choose dashboard" menu in the "Dashboard" page
    When user clicks on the "Select Dashboard" button menu on the "Dashboard" page
    Then user sees the "Close" button in the "Choose dashboard" menu


  @clearIndexedDb
  Scenario: Checking the functionality of the "Select Dashboard" button in the menu for the created "Dashboard"
    Given user goes to the "Dashboard" page at link by id "158ff123-9d51-46d3-a732-e86c8a915360"
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user not sees the "Choose dashboard" menu in the "Dashboard" page
    And user clicks on the "Select Dashboard" button menu on the "Dashboard" page
    And user sees the "Choose dashboard" menu in the "Dashboard" page
    When user clicks on the "Select Dashboard" button menu on the "Dashboard" page
    Then user not sees the "Choose dashboard" menu in the "Dashboard" page


  @clearIndexedDb
  Scenario: Checking the functionality of the "Close" button in the "Choose dashboard" menu
    Given user goes to the "Dashboard" page at link by id "158ff123-9d51-46d3-a732-e86c8a915360"
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user not sees the "Choose dashboard" menu in the "Dashboard" page
    And user clicks on the "Select Dashboard" button menu on the "Dashboard" page
    And user sees the "Choose dashboard" menu in the "Dashboard" page
    When user clicks on the "Close" button in the "Choose dashboard" menu
    Then user not sees the "Choose dashboard" menu in the "Dashboard" page


  @clearIndexedDb
  Scenario: Checking the functionality of the "Set Backtesting" button in the menu
    Given user goes to the "Dashboard" page
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user sees the "Select dashboard" label in the "Dashboard" page
    And user sees the "Choose dashboard" menu in the "Dashboard" page
    And user deletes all "New Dashboard" the "Choose dashboard" menu in the "Dashboard" page
    And user clicks on the "Add" button in the "Choose dashboard" menu
    When user sets a random number value in the "Set Backtesting" input
    And user sees a random backtesting value in the menu
    Then user sees a random backtesting value in the URL page
