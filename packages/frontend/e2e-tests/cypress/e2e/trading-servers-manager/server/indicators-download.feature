Feature: e2e tests: "TSM" page test suit. I as a User check the download of row of "Indicators" tab

  Background:
    Given user selects the "default" server

  @clearIndexedDb
  Scenario Outline: Checking the row download by "<NameButton>" button
    Given user goes on the "Trading Servers Manager" page with the selected "Indicators" tab
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user types "Hero.t_17.target_amount" in the input field
    And user sees the "Hero.t_17.target_amount" in "Name" column of table
    When user clicks on the "<NameButton>" button
    Then user sees the "<SuccessMessage>" success message
    And user checks the downloaded file with file "<NameFile>"

    Examples:
      | NameButton | SuccessMessage                           | NameFile                    |
      | CSV        | 1 table rows copied to clipboard as CSV  | indicators/indicators.csv   |
      | TSV        | 1 table rows copied to clipboard as TSV  | indicators/indicators.tsv   |
      | JSON       | 1 table rows copied to clipboard as JSON | indicators/indicators.json  |


  @clearIndexedDb
  Scenario: Checking "Row" saving using "CTRL+C" buttons
    Given user goes on the "Trading Servers Manager" page with the selected "Indicators" tab
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user types "Hero.t_541.target_amount" in the input field
    And user sees the "Hero.t_541.target_amount" in "Name" column of table
    And user copies the "robot.trading_tasks" value of the "Row" using the CTRL+C command
    And user checks the downloaded file with file "indicators/indicators-row.txt"


  @clearIndexedDb
  Scenario Outline: Checking "<TableElement>" saving via the context menu
    Given user goes on the "Trading Servers Manager" page with the selected "Indicators" tab
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user types "Hero.t_541.target_amount" in the input field
    And user sees the "Hero.t_541.target_amount" in "Name" column of table
    And user copies the "robot.trading_tasks" value of the "<TableElement>" via the context menu
    And user checks the downloaded file with file "<NameFile>"


    Examples:
      | TableElement | NameFile                       |
      | Cell         | indicators/indicators-cell.txt |
      | Row          | indicators/indicators-row.txt  |


  @clearIndexedDb
  Scenario Outline: Checking "<TableElement>" saving via the context menu
    Given user goes on the "Trading Servers Manager" page with the selected "Indicators" tab
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user clicks header table "Name" button
    And user types "Hero.t_541" in the input field
    And user sees the "Hero.t_541" in "Name" column of table
    And user selects a "<TableElement>" that contains the name "robot.trading_tasks"
    Then user copies the "robot.trading_tasks" value of the "Rows" via the context menu
    And user checks the downloaded file with file "<NameFile>"


    Examples:
      | TableElement | NameFile                           |
      | Two Rows     | indicators/indicators-two-rows.txt |
      | All Rows     | indicators/indicators-six-rows.txt |


  @clearIndexedDb
  Scenario Outline: Checking the "<TableElement>" download by "JSON" button
    Given user goes on the "Trading Servers Manager" page with the selected "Indicators" tab
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user clicks header table "Name" button
    And user types "Hero.t_541" in the input field
    And user sees the "Hero.t_541" in "Name" column of table
    And user selects a "<TableElement>" that contains the name "robot.trading_tasks"
    When user clicks on the "JSON" button
    Then user sees the "<SuccessMessage>" success message
    And user checks the downloaded file with file "<NameFile>"


    Examples:
      | TableElement | SuccessMessage                           | NameFile                            |
      | Two Rows     | 2 table rows copied to clipboard as JSON | indicators/indicators-two-rows.json |
      | All Rows     | 6 table rows copied to clipboard as JSON | indicators/indicators-six-rows.json |