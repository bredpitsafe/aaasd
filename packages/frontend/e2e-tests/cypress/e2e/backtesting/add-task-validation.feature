Feature: e2e tests: "BM" page test suit. I as User checks the functionality validation of "Add Task" tap

  Background:
    Given user selects the "autotest" server
    And user goes to the "Backtesting Manager" page with the backend server parameter
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user clicks the "Add Task" button in the menu "Backtesting Manager"
    And user types random value in the "Common" tab input
    And user types date in the calendar from "dataTask" object
    And user types date in the "Config Template" tab


  @clearIndexedDb
  Scenario Outline: Checking validation of "<NameInput>" input in the "Add Task" tap
    And user clears the "<NameInput>" input field
    When user sees the "<ErrorMessage>" error message in the "Add Task" tab
    Then user checks the "Create and Run" button not enable

    Examples:
      | NameInput        | ErrorMessage                        |
      | Name             | Name is a required field            |
      | Description      | Description is a required field     |
      | Config template  | Config template is a required field |


  @clearIndexedDb
  Scenario: Checking validation of "Config template" input in the "Add Task" tap
    And user types date in the "Robots" tab
    And user selects the "Common" tab in the "Add Task" tab
    And user clears the "Config template" input field
    And user types invalid config in the "Config template" input field
    When user sees the "Expecting </simulate> found </backtest_config>" error message in the "Add Task" tab
    Then user checks the "Create and Run" button not enable


  @clearIndexedDb
  Scenario Outline: Checking validation of "<NameInput>" input in the "Add Task" tap
    And user types date in the "Robots" tab
    And user clears the "<NameInput>" input field
    When user sees the "<ErrorMessage>" error message in the "Add Task" tab
    Then user checks the "Create and Run" button not enable

    Examples:
      | NameInput     | ErrorMessage                   |
      | Robot Name    | Robot Name is required field   |
      | Robot Kind    | Robot Kind is required field   |
      | Robot Config  | Robot Config is required field |


  @clearIndexedDb
  Scenario: Checking validation of "Robot Config" input in the "Add Task" tap
    And user types date in the "Robots" tab
    And user clears the "Robot Config" input field
    And user types invalid config in the "Robot Config" input field
    When user sees the "Expecting" error message in the "Add Task" tab
    Then user checks the "Create and Run" button not enable


  @clearIndexedDb
  Scenario: Checking validation of "Template variables" input in the "Add Task" tap
    And user types date in the "Robots" tab
    And user selects the "Template variables" tab in the "Add Task" tab
    And user types invalid config in the "Template variables" input field
    When user sees the "can't parse template variables with #1: expected value at line 1 column 1" error message in the "Add Task" tab
    Then user checks the "Create and Run" button not enable
