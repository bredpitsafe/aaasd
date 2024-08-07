Feature: e2e tests: "Dashboard" page test suit. I as User checks the functionality "Set Layout" popover

  @clearIndexedDb
  Scenario Outline: Checking the functionality of the "Set Layout" button and selects "<NamePanel>" panel in the menu
    Given user goes to the "Dashboard" page at link by id "c9d4f32e-a169-401a-88fc-62cee9f7abfb"
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user sees the menu on the "Dashboard" page
    When user clicks on the "Set Layout" button and selects "<NamePanel>" in the menu "Dashboard" page
    And user sees the "Layout updated" success message
    Then user sees the values "<Width>" Width and "<Height>" Height the dashboard card

    Examples:
      | NamePanel | Width  | Height |
      | 1x3       | 1719px | 395px  |
      | 2x3       | 858px  | 395px  |
      | 3x3       | 570px  | 395px  |
      | 4x3       | 427px  | 395px  |


  @clearIndexedDb
  Scenario: Checking the functionality of the "Set Layout" button in the menu and add new layout
    Given user goes to the "Dashboard" page
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user sees that all buttons are disabled in the menu
    And user deletes all "New Dashboard" the "Choose dashboard" menu in the "Dashboard" page
    And user clicks on the "Add" button in the "Choose dashboard" menu
    When user clicks on the "Add Panel" button and selects "Chart" in the menu "Dashboard" page
    And user clicks on the "Set Layout" button menu on the "Dashboard" page
    When user types a random name in the "Layout name" input
    And user clicks on the "Add Layout" button in the "Set Layout" popover
    When user sees a random name in the "Set Layout" popover
    And user clicks on the "Delete Layout" button in the "Set Layout" popover
    Then user not sees a random name in the "Set Layout" popover


  @clearIndexedDb
  Scenario: Checking the functionality of the "Set Layout" button in the menu and add new layout without "Add Layout" button
    Given user goes to the "Dashboard" page
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user sees that all buttons are disabled in the menu
    And user deletes all "New Dashboard" the "Choose dashboard" menu in the "Dashboard" page
    And user clicks on the "Add" button in the "Choose dashboard" menu
    When user clicks on the "Add Panel" button and selects "Chart" in the menu "Dashboard" page
    And user clicks on the "Set Layout" button menu on the "Dashboard" page
    When user types a random name in the "Layout name" input and click "Enter"
    When user sees a random name in the "Set Layout" popover
    And user clicks on the "Delete Layout" button in the "Set Layout" popover
    Then user not sees a random name in the "Set Layout" popover

