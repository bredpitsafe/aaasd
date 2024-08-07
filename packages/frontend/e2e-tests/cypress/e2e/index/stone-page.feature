Feature: e2e tests: "Stone" page test suit. I as User checks the functionality of links on the "Stone" page

  Scenario: Checking the link to the "Dashboard" page
    Given user goes to the "Stone" page
    And user sees the "Authorization" page and logs in as a "Frontend" user
    When user click an the "Dashboard" link
    Then user sees the "Dashboard" page


  Scenario Outline: Checking link to the "<PageType>" page
    Given user goes to the "Stone" page
    And user sees the "Authorization" page and logs in as a "Frontend" user
    When user click an the "<PageType>" link
    Then user on the "<PageType>" page with the "ModalSettings" modal

    Examples:
      | PageType                |
      | Trading Servers Manager |
      | Herodotus Terminal      |
      | Trading Stats           |
      | Backtesting Manager     |
      | Balance Monitor         |
      | WS Query Terminal       |


  Scenario Outline: Checking move to the "<PageType>" page with the backend server parameter
    Given user opens the "<PageType>" page
    And user sees the "Authorization" page and logs in as a "Frontend" user
    When user types the modal settings with the "default" backend server parameter
    Then user sees the "<PageType>" page

    Examples:
      | PageType                |
      | Trading Servers Manager |
      | Trading Stats           |
      | Backtesting Manager     |
      | WS Query Terminal       |


  Scenario: Checking move to the "Herodotus Terminal" page with the backend server parameter
    Given user opens the "Herodotus Terminal" page
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user types the modal settings with the "default" backend server parameter
    When user sees "HerodotusMulti,Herodotus" in the dialog modal
    And user selects "HerodotusMulti" in the dialog modal
    Then user sees the "Herodotus Terminal" page


  Scenario Outline: Checking move to the "<PageType>" page with the backend server parameter
    Given user opens the "Balance Monitor" page
    And user sees the "Authorization" page and logs in as a "Frontend" user
    When user types the modal settings with the "atf-dev" backend server parameter
    Then user sees the "<PageType>" page

    Examples:
      | PageType         |
      | Balance Monitor  |

