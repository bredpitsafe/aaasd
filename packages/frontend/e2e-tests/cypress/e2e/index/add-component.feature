Feature: e2e tests: "TSM" page test suit. I as User checks the functionality of "Add Component" tap

  Background:
    Given user selects the "qa" server

  @clearIndexedDb
  Scenario Outline: Checking the selection of the "Add Component" tab in the <NameComponent> table
    Given user goes to the "Trading Servers Manager" page with the backend server parameter
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user sees the name "Server" in the header
    When user clicks on the "Add Component" button in the "<NameComponent>" table
    And user selects the "Add Component" tab on the "Trading Servers Manager" page
    And user sees the "Add Component" tab in the "Trading Servers Manager" page
    Then user sees the "<NameType>" type in the types selector

    Examples:
      | NameComponent  | NameType  |
      | Exec Gates     | ExecGate  |
      | MD Gates       | MdGate    |
      | Robots         | Robot     |


  @clearIndexedDb
  Scenario Outline: Checking validation of "<NameInput>" input
    Given user goes to the "Trading Servers Manager" page with the backend server parameter
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user sees the name "Server" in the header
    And user clicks on the "Add Component" button in the "Robots" table
    When user clears the "<NameInput>" input in the "Add Component" tab
    Then user sees the "<ErrorMessage>" type in the "Add Component" tab

    Examples:
      | NameInput | ErrorMessage             |
      | Name      | name is a required field |
      | Kind      | kind is a required field |


  @clearIndexedDb
  Scenario: Checking the functionality of "Kind Switch" button
    Given user goes to the "Trading Servers Manager" page with the backend server parameter
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user sees the name "Server" in the header
    And user clicks on the "Add Component" button in the "MD Gates" table
    And user sees "Kind Selector" in the "Add Component" tab
    When user clicks on the "Kind Switch" button
    Then user sees "Kind Input" in the "Add Component" tab


  @clearIndexedDb
  Scenario Outline: Checking the addition of a new "<NameComponent>" component
    Given user goes to the "Trading Servers Manager" page with the backend server parameter
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user sees the name "Server" in the header
    And user clicks on the "Add Component" button in the "<NameComponent>" table
    And user types random value in the "Name" input
    And user selects the "<NameKind>" in the "Kind" selector
    And user types the config of a new "<NameComponent>" component
    When user clicks on the "Create" button
    And user sees the "Component has been created successfully" success message
    Then user sees "new Component" in the "<NameComponent>" table
    And user deletes created component

    Examples:
      | NameComponent  | NameKind     |
      | Exec Gates     | BinanceSwap  |
      | MD Gates       | BinanceSwap  |


  @clearIndexedDb
  Scenario: Checking the addition of a new "Robots" component
    Given user goes to the "Trading Servers Manager" page with the backend server parameter
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user sees the name "Server" in the header
    And user clicks on the "Add Component" button in the "Robots" table
    And user types random value in the "Name" input
    And user types the "md_subscriber" in the "Kind" selector
    And user types the config of a new "Robots" component
    When user clicks on the "Create" button
    And user sees the "Component has been created successfully" success message
    Then user sees "new Component" in the "Robots" table
    And user deletes created component

