Feature: e2e tests: "TSM" page test suit. I as User checks the functionality of "Status Messages" tab

  Background:
    Given user selects the "default" server

  @clearIndexedDb
  Scenario: Checking the visibility of different statuses for different components
    Given user goes to the "Trading Servers Manager" page with the backend server parameter
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user selects "TestMdIndicator" component from "Robots" table
    And user "starts" the "TestMdIndicator" Robot
    When user selects the "Status Messages" tab on the "Trading Servers Manager" page
    And user sees the "Status Messages" tab in the "Trading Servers Manager" page
    When user sees a message "working" in the "Status Messages" tab
    And user "starts" the "Herodotus" Robot
    And user selects "HerodotusMulti" component from "Robots" table
    When user sees a message "waiting real" in the "Status Messages" tab
    And user sees the "Enabled" status near the name "StateSaveRobot" in the "Robots" table
    And user selects "StateSaveRobot" component from "Robots" table
    When user sees a message "component autostart is disabled" in the "Status Messages" tab
    And user sees the "Disabled" status near the name "StateSaveRobot" in the "Robots" table
    And user selects "FXProvider" component from "Robots" table
    Then user sees a message "working" in the "Status Messages" tab
    And user sees the "Enabled" status near the name "FXProvider" in the "Robots" table


  @clearIndexedDb
  Scenario: Checking the visibility of the "component config is invalid" status in the "Status Messages" tab robot component
    Given user goes on the "Trading Servers Manager" page with selected "Config" tab of the "StatusMessageRobot" "Robot"
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user "stops" the "StatusMessageRobot" Robot
    When user sets the "incorrect" configuration for the "md_indicator" "Robot"
    And user sees the "Config for robot(3217) updated" success message
    And user "restart" the "StatusMessageRobot" Robot
    And user selects the "Status Messages" tab on the "Trading Servers Manager" page
    And user sees a message "apply new config to see detailed error message" in the "Status Messages" tab
    And user sees a message "component config is invalid" in the "Status Messages" tab
    Then user sees a new time message in the "Status Messages" tab
    And user sees the "Failed" status near the name "StateSaveRobot" in the "Robots" table


  @clearIndexedDb
  Scenario: Checking the visibility of the "working" status in the "Status Messages" tab robot component
    Given user goes on the "Trading Servers Manager" page with selected "Config" tab of the "StatusMessageRobot" "Robot"
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user "stops" the "StatusMessageRobot" Robot
    When user sets the "correct" configuration for the "md_indicator" "Robot"
    And user sees the "Config for robot(3217) updated" success message
    And user "restart" the "StatusMessageRobot" Robot
    And user selects the "Status Messages" tab on the "Trading Servers Manager" page
    And user sees a message "initializing" in the "Status Messages" tab
    And user sees a message "working" in the "Status Messages" tab
    Then user sees a new time message in the "Status Messages" tab
    And user sees the "Enabled" status near the name "StateSaveRobot" in the "Robots" table


  @clearIndexedDb
  Scenario: Checking the visibility of the "component config is invalid" status in the "Status Messages" tab gate component
    Given user goes on the "Trading Servers Manager" page with selected "Config" tab of the "Deribit" "Gate"
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user "stops" the "Deribit" "Exec Gates"
    When user sets the "incorrect" configuration for the "Deribit" "Exec Gate"
    And user sees the "Config for gate(4604) updated" success message
    And user "restart" the "Deribit" "Exec Gates"
    And user selects the "Status Messages" tab on the "Trading Servers Manager" page
    And user sees a message "apply new config to see detailed error message" in the "Status Messages" tab
    When user sees a message "component config is invalid" in the "Status Messages" tab
    Then user sees a new time message in the "Status Messages" tab
    And user sees the "Failed" status near the name "Deribit" in the "Exec Gates" table


  @clearIndexedDb
  Scenario: Checking the visibility of the "working, stopping" status in the "Status Messages" tab gate component
    Given user goes on the "Trading Servers Manager" page with selected "Config" tab of the "Deribit" "Gate"
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user "stops" the "Deribit" "Exec Gates"
    When user sets the "correct" configuration for the "Deribit" "Exec Gate"
    And user sees the "Config for gate(4604) updated" success message
    And user "restart" the "Deribit" "Exec Gates"
    And user selects the "Status Messages" tab on the "Trading Servers Manager" page
    And user sees a message "initializing" in the "Status Messages" tab
    When user sees a message "working" in the "Status Messages" tab
    And user sees a new time message in the "Status Messages" tab
    And user sees the "Enabled" status near the name "StateSaveRobot" in the "Robots" table
    And user "stops" the "Deribit" "Exec Gates"
    Then user sees a message "stopping by user" in the "Status Messages" tab
    And user sees a new time message in the "Status Messages" tab
    And user sees the "Disabled" status near the name "StateSaveRobot" in the "Robots" table