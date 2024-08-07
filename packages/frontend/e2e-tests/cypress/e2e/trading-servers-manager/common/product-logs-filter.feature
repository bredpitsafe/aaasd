Feature: e2e tests: "TSM" page test suit. I as a user check the function of "Include" and "Exclude" filters of "Product Logs" tab

  Background:
    Given user selects the "default" server

  @clearIndexedDb
  Scenario Outline: Checking the selection of "<LevelName>" from the "Level" filter
    Given user goes on the "Trading Servers Manager" page with the selected "Product Logs" tab
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user opens the "Server Filter" panel
    And user clears the "Level" filters
    When user selects "<LevelName>" from the "Level" filter
    Then user sees the logs with "<LevelName>" level filter in the table

    Examples:
      | LevelName  |
      | Info       |
      | Warn       |
      | Error      |


  @clearIndexedDb
  Scenario: Checking of sequential search by three filters
    Given user goes on the "Trading Servers Manager" page with the selected "Product Logs" tab
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user opens the "Server Filter" panel
    And user clears the "Level" filters
    And user selects "Error" from the "Level" filter
    And user sees the logs with "Error" level filter in the table
    And user clears the "Error" "Level" filter
    When user selects "Info" from the "Level" filter
    Then user sees the logs with "Info" level filter in the table
    And user clears the "Info" "Level" filter
    When user selects "Warn" from the "Level" filter
    Then user sees the logs with "Warn" level filter in the table


  @clearIndexedDb
  Scenario Outline: Checking the functionality of input "<NameInput>" in the "Include" filter. Typing "<InputType>"
    Given user goes on the "Trading Servers Manager" page with the selected "Product Logs" tab
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user sees the "Product Logs" tab in the "Trading Servers Manager" page
    And user opens the "Server Filter" panel
    And user select column by "Time,<NameInput>" name
    When user types "<InputType>" in the "<NameInput>" input of the filter "Include"
    Then user sees inputted "<InputType>" in the "<NameInput>" column

    Examples:
      | NameInput    | InputType                               |
      | Message      | Account                                 |
      | Actor Key    | R:917:test_md_indicator.TestMdIndicator |
      | Actor Group  | coordinator                             |


  @clearIndexedDb
  Scenario Outline: Checking the functionality of input "<NameInput>" in the "Exclude" filter. Typing "<InputType>"
    Given user goes on the "Trading Servers Manager" page with the selected "Product Logs" tab
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user sees the "Product Logs" tab in the "Trading Servers Manager" page
    And user opens the "Server Filter" panel
    And user select column by "Time,<NameInput>" name
    When user types "<InputType>" in the "<NameInput>" input of the filter "Exclude"
    Then user not sees inputted "<InputType>" in the "<NameInput>" column

    Examples:
      | NameInput    | InputType                               |
      | Message      | Initializing                            |
      | Actor Key    | R:917:test_md_indicator.TestMdIndicator |
      | Actor Group  | coordinator                             |


  @clearIndexedDb
  Scenario Outline: Checking the functionality of input "<NameInput>" in the "Include" filter. Typing "<InputTypeOne>" and "<InputTypeTwo>"
    Given user goes on the "Trading Servers Manager" page with the selected "Product Logs" tab
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user sees the "Product Logs" tab in the "Trading Servers Manager" page
    And user opens the "Server Filter" panel
    And user select column by "Time,<NameInput>" name
    And user types "<InputTypeOne>" in the "<NameInput>" input of the filter "Include"
    And user sees inputted "<InputTypeOne>" in the "<NameInput>" column
    When user types "<InputTypeTwo>" in the "<NameInput>" input of the filter "Include"
    Then user sees inputted "<InputTypeTwo>" in the "<NameInput>" column

    Examples:
      | NameInput    | InputTypeOne       | InputTypeTwo  |
      | Message      | AutotestForVirtual | Account       |


  @clearIndexedDb
  Scenario Outline: Checking the functionality of input "<NameInput>" in the "Exclude" filter. Typing "<InputTypeOne>" and "<InputTypeTwo>"
    Given user goes on the "Trading Servers Manager" page with the selected "Product Logs" tab
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user sees the "Product Logs" tab in the "Trading Servers Manager" page
    And user opens the "Server Filter" panel
    And user select column by "Time,<NameInput>" name
    And user types "<InputTypeOne>" in the "<NameInput>" input of the filter "Exclude"
    And user not sees inputted "<InputTypeOne>" in the "<NameInput>" column
    When user types "<InputTypeTwo>" in the "<NameInput>" input of the filter "Exclude"
    Then user not sees inputted "<InputTypeOne>" or "<InputTypeTwo>" in the "<NameInput>" column

    Examples:
      | NameInput    | InputTypeOne  | InputTypeTwo             |
      | Actor Group  | coordinator   | component_status_holder  |


  @clearIndexedDb
  Scenario Outline: Checking the functionality of inputs "<NameInputOne>" and "<NameInputTwo>" in the "Include" filter. Typing "<InputTypeOne>" and "<InputTypeTwo>"
    Given user goes on the "Trading Servers Manager" page with the selected "Product Logs" tab
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user sees the "Product Logs" tab in the "Trading Servers Manager" page
    And user opens the "Server Filter" panel
    And user select columns by "Time,<NameInputOne>,<NameInputTwo>" names
    And user types "<InputTypeOne>" in the "<NameInputOne>" input of the filter "Include"
    And user sees inputted "<InputTypeOne>" in the "<NameInputOne>" column
    And user types "<InputTypeTwo>" in the "<NameInputTwo>" input of the filter "Include"
    When user sees inputted "<InputTypeOne>" in the "<NameInputOne>" column
    Then user sees inputted "<InputTypeTwo>" in the "<NameInputTwo>" column

    Examples:
      | NameInputOne  | NameInputTwo  | InputTypeOne  | InputTypeTwo  |
      | Message       | Actor Group   | Account       | coordinator   |
      | Actor Group   | Message       | robots        | started       |


  @clearIndexedDb
  Scenario Outline: Checking the functionality of inputs "<NameInputOne>" and "<NameInputTwo>" in the "Exclude" filter. Typing "<InputTypeOne>" and "<InputTypeTwo>"
    Given user goes on the "Trading Servers Manager" page with the selected "Product Logs" tab
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user sees the "Product Logs" tab in the "Trading Servers Manager" page
    And user opens the "Server Filter" panel
    And user select columns by "Time,<NameInputOne>,<NameInputTwo>" names
    And user types "<InputTypeTwo>" in the "<NameInputTwo>" input of the filter "Exclude"
    Then user not sees inputted "<InputTypeTwo>" in the "<NameInputTwo>" column
    And user types "<InputTypeOne>" in the "<NameInputOne>" input of the filter "Exclude"
    And user not sees inputted "<InputTypeOne>" in the "<NameInputOne>" column

    Examples:
      | NameInputOne  | NameInputTwo  | InputTypeOne                            | InputTypeTwo    |
      | Actor Key     | Actor Group   | R:917:test_md_indicator.TestMdIndicator | robots          |
      | Actor Group   | Message       | component_status_holder                 | changed status  |


  @clearIndexedDb
  Scenario Outline: Checking the functionality of inputs "<NameInputOne>" and "<NameInputTwo>" in the "Include" and "Exclude" filters. Typing "<InputTypeOne>" and "<InputTypeTwo>"
    Given user goes on the "Trading Servers Manager" page with the selected "Product Logs" tab
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user sees the "Product Logs" tab in the "Trading Servers Manager" page
    And user opens the "Server Filter" panel
    And user select columns by "Time,<NameInputOne>,<NameInputTwo>" names
    And user types "<InputTypeOne>" in the "<NameInputOne>" input of the filter "Include"
    And user types "<InputTypeTwo>" in the "<NameInputTwo>" input of the filter "Exclude"
    When user sees inputted "<InputTypeOne>" in the "<NameInputOne>" column
    Then user not sees inputted "<InputTypeTwo>" in the "<NameInputTwo>" column

    Examples:
      | NameInputOne  | NameInputTwo  | InputTypeOne            | InputTypeTwo  |
      | Message       | Actor Group   | Binance                 | robots        |
      | Actor Group   | Message       | component_status_holder | Failed        |