Feature: e2e tests: "Dashboard" page test suit. I as User checks the functionality "Permissions modal"

  @clearIndexedDb
  Scenario Outline: Checking the opening of the "Change dashboard permissions" modal. Checking the functionality of the "<NameButton>" button
  Given user goes to the "Dashboard" page at link by id "aaf57a90-c71b-4a2d-a28d-c0ee1f7f2829"
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user clicks on the "Share Dashboard" button menu on the "Dashboard" page
    When user sees the "Change dashboard permissions" modal
    Then user clicks on the "<NameButton>" button in the "Change dashboard permissions" modal
    And user not sees the "Change dashboard permissions" modal

    Examples:
      | NameButton   |
      | Close        |
      | Cancel       |


  @clearIndexedDb
  Scenario: Checking the functionality of "Show only active permissions" switch in the "Change dashboard permissions" modal
    Given user goes to the "Dashboard" page at link by id "aaf57a90-c71b-4a2d-a28d-c0ee1f7f2829"
    And user sees the "Authorization" page and logs in as a "Frontend" user
    When user clicks on the "Share Dashboard" button menu on the "Dashboard" page
    And user sees the "Change dashboard permissions" modal
    And user checks that the "Show only active permissions" switch is turned off
    And user clicks "Show only active permissions" switch in the "Change dashboard permissions" modal
    Then user sees the "ShowOnlyActivePermissions updated successfully" success message
    And user checks that the "Show only active permissions" switch is turned on


  @clearIndexedDb
  Scenario Outline: Checking the functionality of "<NameFilter>" filter in the "Change dashboard permissions" modal
    Given user goes to the "Dashboard" page at link by id "54bde2b5-9687-4a06-9baf-1852eef041ab"
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user clicks on the "Share Dashboard" button menu on the "Dashboard" page
    And user sees the "Change dashboard permissions" modal
    And user checks that the "Show only active permissions" switch is turned off
    When user types "svc_test-qa-ck" in the "Permission" "<NameFilter>" filter
    Then user sees the "svc_test-qa-ck" in "<NameFilter>" column of "Permission" table

    Examples:
      | NameFilter   |
      | User         |
      | Nickname     |


  @clearIndexedDb
  Scenario Outline: Checking that there is a notice "No Rows To Show" in the "Change dashboard permissions" modal with "<NameFilter>" filter
    Given user goes to the "Dashboard" page at link by id "54bde2b5-9687-4a06-9baf-1852eef041ab"
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user clicks on the "Share Dashboard" button menu on the "Dashboard" page
    And user sees the "Change dashboard permissions" modal
    And user checks that the "Show only active permissions" switch is turned off
    When user types "X?@/Y" in the "Permission" "<NameFilter>" filter
    Then user sees "No Rows To Show" in the table

    Examples:
      | NameFilter   |
      | User         |
      | Nickname     |


  @clearIndexedDb
  Scenario Outline: Checking that the owner of the dashboard is not visible in the "Change dashboard permissions" modal with "<NameFilter>" filter
    Given user goes to the "Dashboard" page at link by id "54bde2b5-9687-4a06-9baf-1852eef041ab"
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user clicks on the "Share Dashboard" button menu on the "Dashboard" page
    And user sees the "Change dashboard permissions" modal
    And user checks that the "Show only active permissions" switch is turned off
    When user types "svc_frontend" in the "Permission" "<NameFilter>" filter
    Then user not sees the "svc_frontend" in "<NameFilter>" column of "Permission" table

    Examples:
      | NameFilter   |
      | User         |
      | Nickname     |


  @clearIndexedDb
  Scenario Outline: Checking the functionality of Permission filter in the "Change dashboard permissions" modal with "<NamePermission> filter
    Given user goes to the "Dashboard" page at link by id "<DashboardID>"
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user clicks on the "Share Dashboard" button menu on the "Dashboard" page
    And user sees the "Change dashboard permissions" modal
    And user checks that the "Show only active permissions" switch is turned off
    When user selects the "<NamePermission>" Permission filter in the context menu table
    Then user sees the "<NamePermission>" in "Permission" column of "Permission" table

    Examples:
      | NamePermission | DashboardID                          |
      | None           | 54bde2b5-9687-4a06-9baf-1852eef041ab |
      | Editor         | a3e46dd0-ed31-4bb9-8175-e506c50ca5b3 |
      | Viewer         | a4c8ff5f-ff41-46f9-9297-67f5f353ddae |
      | Owner          | c1970617-e5b8-4cf2-a080-35ca3ca088b8 |


  @clearIndexedDb
  Scenario: Checking the functionality of the visibility of the new dashboard a user with "None" Permission
    Given user goes to the "Dashboard" page
    And user sees the "Authorization" page and logs in as a "LimitUser" user
    And user sees the "Select dashboard" label in the "Dashboard" page
    And user sees the "Choose dashboard" menu in the "Dashboard" page
    And user deletes all "New Dashboard" the "Choose dashboard" menu in the "Dashboard" page
    When user clicks on the "Add" button in the "Choose dashboard" menu
    And user click "Log Out" button on the "Dashboard" page
    And user sees the "Authorization" page and logs in as a "Frontend" user
    Then user sees the "Failed to subscribe to dashboard: You do not have permission to view this dashboard" notification message
    And user sees the "Unknown error" label in the "Dashboard" page


  @clearIndexedDb
  Scenario: Checking the functionality of the visibility of the new dashboard a user with "Viewer" Permission
    Given user goes to the "Dashboard" page
    And user sees the "Authorization" page and logs in as a "LimitUser" user
    And user sees the "Select dashboard" label in the "Dashboard" page
    And user sees the "Choose dashboard" menu in the "Dashboard" page
    And user deletes all "New Dashboard" the "Choose dashboard" menu in the "Dashboard" page
    When user clicks on the "Add" button in the "Choose dashboard" menu
    And user clicks on the "Share Dashboard" button menu on the "Dashboard" page
    And user types "svc_frontend" in the "Permission" "User" filter
    When user sets "Viewer" permission in the "Change dashboard permissions" modal
    And user sees "Share" icon near "Share Dashboard" button in the menu "Dashboard" page
    And user click "Log Out" button on the "Dashboard" page
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user not sees the "Share Dashboard" button in the menu "Dashboard" page
    When user clicks on the "Save Changes" button menu on the "Dashboard" page
    Then user sees the "Change Dashboard name" modal


  @clearIndexedDb
  Scenario: Checking the functionality of the visibility of the new dashboard a user with "Editor" Permission
    Given user goes to the "Dashboard" page
    And user sees the "Authorization" page and logs in as a "LimitUser" user
    And user sees the "Select dashboard" label in the "Dashboard" page
    And user sees the "Choose dashboard" menu in the "Dashboard" page
    And user deletes all "New Dashboard" the "Choose dashboard" menu in the "Dashboard" page
    When user clicks on the "Add" button in the "Choose dashboard" menu
    And user clicks on the "Share Dashboard" button menu on the "Dashboard" page
    And user types "svc_frontend" in the "Permission" "User" filter
    When user sets "Editor" permission in the "Change dashboard permissions" modal
    And user sees "Share" icon near "Share Dashboard" button in the menu "Dashboard" page
    And user click "Log Out" button on the "Dashboard" page
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user not sees the "Share Dashboard" button in the menu "Dashboard" page
    When user clicks on the "Add Panel" button and selects "Chart" in the menu "Dashboard" page
    And user sees the "Panel added" success message
    And user sees a new "Chart" layout on the "Dashboard" page
    And user clicks on the "Save Changes" button menu on the "Dashboard" page
    When user sees the "Dashboard saved" success message
    And user click "Log Out" button on the "Dashboard" page
    And user sees the "Authorization" page and logs in as a "LimitUser" user
    Then user sees a new "Chart" layout on the "Dashboard" page


  @clearIndexedDb
  Scenario: Checking the functionality of the visibility of the new dashboard a user with "Owner" Permission
    Given user goes to the "Dashboard" page
    And user sees the "Authorization" page and logs in as a "LimitUser" user
    And user sees the "Select dashboard" label in the "Dashboard" page
    And user sees the "Choose dashboard" menu in the "Dashboard" page
    And user deletes all "New Dashboard" the "Choose dashboard" menu in the "Dashboard" page
    When user clicks on the "Add" button in the "Choose dashboard" menu
    And user clicks on the "Share Dashboard" button menu on the "Dashboard" page
    And user types "svc_frontend" in the "Permission" "User" filter
    When user sets "Owner" permission in the "Change dashboard permissions" modal
    And user sees "Share" icon near "Share Dashboard" button in the menu "Dashboard" page
    And user click "Log Out" button on the "Dashboard" page
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user sees the "Share Dashboard" button in the menu "Dashboard" page
    When user clicks on the "Add Panel" button and selects "Chart" in the menu "Dashboard" page
    And user sees the "Panel added" success message
    And user sees a new "Chart" layout on the "Dashboard" page
    When user clicks on the "Save Changes" button menu on the "Dashboard" page
    And user clicks on the "Share Dashboard" button menu on the "Dashboard" page
    And user types "svc_test-qa-ck" in the "Permission" "User" filter
    When user sets "None" permission in the "Change dashboard permissions" modal
    And user not sees "Share" icon near "Share Dashboard" button in the menu "Dashboard" page
    And user click "Log Out" button on the "Dashboard" page
    And user sees the "Authorization" page and logs in as a "LimitUser" user
    Then user sees the "Failed to subscribe to dashboard: You do not have permission to view this dashboard" notification message
    And user sees the "Unknown error" label in the "Dashboard" page


#  @clearIndexedDb https://bhft-company.atlassian.net/browse/FRT-2496
#  Scenario: Checking that the deleted user not seen icon near "Share Dashboard" button
#    Given user goes to the "Dashboard" page at link by id "2fbdeca4-e408-4790-9c88-da5faf7c461a"
#    And user sees the "Authorization" page and logs in as a "Frontend" user
#    When user checks that the "svc_test-qa-ck" user not have dashboard permissions
#    And user not sees "Share" icon near "Share Dashboard" button in the menu "Dashboard" page
#    And user clicks on the "Share Dashboard" button menu on the "Dashboard" page
#    And user checks that the "Show only active permissions" switch is turned off
#    And user types "svc_test-qa-ck" in the "Permission" "User" filter
#    When user sets "Viewer" permission in the "Change dashboard permissions" modal
#    Then user sees "Share" icon near "Share Dashboard" button in the menu "Dashboard" page
#    And user sees that the icon near "Share Dashboard" has a value of "1"
