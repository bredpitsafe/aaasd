Feature: e2e tests: "Dashboard" page test suit. I as User checks the functionality "Choose dashboard" menu

  @clearIndexedDb
  Scenario: Checking the creation new dashboard with "Add" button in the "Choose dashboard" menu
    Given user goes to the "Dashboard" page
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user sees the "Select dashboard" label in the "Dashboard" page
    And user sees the "Choose dashboard" menu in the "Dashboard" page
    And user deletes all "New Dashboard" the "Choose dashboard" menu in the "Dashboard" page
    When user clicks on the "Add" button in the "Choose dashboard" menu
    And user sees the "Dashboard is empty" label in the "Dashboard" page
    And user clicks on the "Select Dashboard" button menu on the "Dashboard" page
    And user sees the "New Dashboard" in the "Choose dashboard" menu
    Then user sees the "Dashboard is empty" label in the "Dashboard" page


  @clearIndexedDb
  Scenario: Checking the functionality "Copy Dashboard URL" selector in the "Choose dashboard" menu
    Given user goes to the "Dashboard" page
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user sees the "Select dashboard" label in the "Dashboard" page
    And user sees the "Choose dashboard" menu in the "Dashboard" page
    And user deletes all "New Dashboard" the "Choose dashboard" menu in the "Dashboard" page
    And user clicks on the "Add" button in the "Choose dashboard" menu
    And user sees the "Dashboard is empty" label in the "Dashboard" page
    And user clicks on the "Select Dashboard" button menu on the "Dashboard" page
    When user selects "Copy Dashboard URL" in the context menu from the "New Dashboard"
    And user sees the "Dashboard URL copied to clipboard" success message
    Then user checks the downloaded URL with data "/dashboard/dashboard?storageId="
    And user checks that the copied URL is equal to the URL of the page


  @clearIndexedDb
  Scenario: Checking the functionality "Rename Dashboard" selector in the "Choose dashboard" menu
    Given user goes to the "Dashboard" page
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user sees the "Select dashboard" label in the "Dashboard" page
    And user sees the "Choose dashboard" menu in the "Dashboard" page
    And user deletes all "New Dashboard" the "Choose dashboard" menu in the "Dashboard" page
    And user clicks on the "Add" button in the "Choose dashboard" menu
    And user sees the "Dashboard is empty" label in the "Dashboard" page
    And user clicks on the "Select Dashboard" button menu on the "Dashboard" page
    When user selects "Rename Dashboard" in the context menu from the "New Dashboard"
    And user types a random value in the "New Dashboard" name
    Then user sees the "random" name "Dashboard" in the "Choose dashboard" menu


  @clearIndexedDb
  Scenario: Checking the functionality "Rename Dashboard" selector with not rename in the "Choose dashboard" menu
    Given user goes to the "Dashboard" page
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user sees the "Select dashboard" label in the "Dashboard" page
    And user sees the "Choose dashboard" menu in the "Dashboard" page
    And user deletes all "New Dashboard" the "Choose dashboard" menu in the "Dashboard" page
    And user clicks on the "Add" button in the "Choose dashboard" menu
    And user sees the "Dashboard is empty" label in the "Dashboard" page
    And user clicks on the "Select Dashboard" button menu on the "Dashboard" page
    When user selects "Rename Dashboard" in the context menu from the "New Dashboard"
    And user not change the name but presses "Enter" in the input field
    Then user sees the "Dashboard already has the same name: Dashboard will not be renamed." notification message
    And user sees the "New Dashboard" in the "Choose dashboard" menu


  @clearIndexedDb
  Scenario: Checking the functionality "Share Dashboard" selector in the "Choose dashboard" menu
    Given user goes to the "Dashboard" page
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user sees the "Select dashboard" label in the "Dashboard" page
    And user sees the "Choose dashboard" menu in the "Dashboard" page
    And user deletes all "New Dashboard" the "Choose dashboard" menu in the "Dashboard" page
    And user clicks on the "Add" button in the "Choose dashboard" menu
    And user sees the "Dashboard is empty" label in the "Dashboard" page
    And user clicks on the "Select Dashboard" button menu on the "Dashboard" page
    When user selects "Share Dashboard" in the context menu from the "New Dashboard"
    Then user sees the "Change dashboard permissions" modal


  @clearIndexedDb
  Scenario: Checking the functionality "Delete Dashboard" selector in the "Choose dashboard" menu
    Given user goes to the "Dashboard" page
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user sees the "Select dashboard" label in the "Dashboard" page
    And user sees the "Choose dashboard" menu in the "Dashboard" page
    And user deletes all "New Dashboard" the "Choose dashboard" menu in the "Dashboard" page
    And user clicks on the "Add" button in the "Choose dashboard" menu
    And user sees the "Dashboard is empty" label in the "Dashboard" page
    And user clicks on the "Select Dashboard" button menu on the "Dashboard" page
    When user selects "Delete Dashboard" in the context menu from the "New Dashboard"
    Then user sees the "Dashboard deleted" success message
    And user not sees the "New Dashboard" in the "Choose dashboard" menu


  @clearIndexedDb
  Scenario: Checking the functionality "Clone Dashboard" selector in the "Choose dashboard" menu
    Given user goes to the "Dashboard" page
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user sees the "Select dashboard" label in the "Dashboard" page
    And user sees the "Choose dashboard" menu in the "Dashboard" page
    And user deletes all "New Dashboard" the "Choose dashboard" menu in the "Dashboard" page
    And user clicks on the "Add" button in the "Choose dashboard" menu
    And user sees the "Dashboard is empty" label in the "Dashboard" page
    And user clicks on the "Select Dashboard" button menu on the "Dashboard" page
    When user selects "Clone Dashboard" in the context menu from the "New Dashboard"
    Then user sees the "Clone dashboard" modal


  @clearIndexedDb
  Scenario: Checking the functionality "Save Dashboard" selector in the "Choose dashboard" menu
    Given user goes to the "Dashboard" page
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user deletes all "New Dashboard" the "Choose dashboard" menu in the "Dashboard" page
    And user clicks on the "Add" button in the "Choose dashboard" menu
    And user clicks on the "Add Panel" button and selects "Chart" in the menu "Dashboard" page
    And user sees the "Panel added" success message
    And user clicks on the "Select Dashboard" button menu on the "Dashboard" page
    When user sees a "star" icon near "New Dashboard" name in the "Choose dashboard" menu
    When user selects "Save Dashboard" in the context menu from the "New Dashboard"
    And user sees the "Dashboard saved" success message
    Then user not sees a "star" icon near "New Dashboard" name in the "Choose dashboard" menu


  @clearIndexedDb
  Scenario: Checking the functionality "Revert Changes" selector in the "Choose dashboard" menu
    Given user goes to the "Dashboard" page
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user deletes all "New Dashboard" the "Choose dashboard" menu in the "Dashboard" page
    And user clicks on the "Add" button in the "Choose dashboard" menu
    And user clicks on the "Add Panel" button and selects "Chart" in the menu "Dashboard" page
    And user sees the "Panel added" success message
    And user clicks on the "Select Dashboard" button menu on the "Dashboard" page
    When user sees a "star" icon near "New Dashboard" name in the "Choose dashboard" menu
    When user selects "Revert Changes" in the context menu from the "New Dashboard"
    And user sees the "Changes reverted" success message
    Then user not sees a "star" icon near "New Dashboard" name in the "Choose dashboard" menu
    And user sees the "Dashboard is empty" label in the "Dashboard" page