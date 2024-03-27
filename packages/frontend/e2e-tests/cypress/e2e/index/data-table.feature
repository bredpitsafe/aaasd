Feature: e2e tests: "Stone" page test suit. I as User checks the functionality of the tables on the TSM

  Background:
    Given user selects the "default" server
    And user goes on the "Trading Servers Manager" page with the selected "Product Logs" tab
    And user sees the "Product Logs" tab
    And user select columns by "Time UTC,Message,Actor Key,Actor Group" names

  @clearIndexedDb
  Scenario: "Product Logs" tab. Checking the table update after robot startup
    And user "starts" the "TestIndicatorRobot" Robot
    And user "stops" the "TestIndicatorRobot" Robot
    And user sees value: "test_indicator_robot.TestIndicatorRobot changed status" in the "Message" column on the "Product Logs" table
    And user remembers the first value in column "Message"
    And user remembers the first value in column "Time"
    When user "starts" the "TestIndicatorRobot" Robot
    And user sees that the new value in column "Message" has no duplicates
    And user sees value: "setup indicator robot begin" in the "Message" column on the "Product Logs" table
    And user sees value: "R:1217:test_indicator_robot.TestIndicatorRobot" in the "Actor Key" column on the "Product Logs" table
    And user sees value: "robots" in the "Actor Group" column on the "Product Logs" table
    And user sees that the first value in column "Message" has changed
    Then user sees that the first value in column "Time" has changed


  @clearIndexedDb
  Scenario: "Product Logs" tab. Checking the table update after scrolls down and robot startup
    And user "starts" the "TestIndicatorRobot" Robot
    And user "stops" the "TestIndicatorRobot" Robot
    And user remembers the first value in column "Time"
    When user scrolls "down" in the "Product Logs" table
    And user "stops" the "TestIndicatorRobot" Robot
    And user "starts" the "TestIndicatorRobot" Robot
    When user reload a page
    And user sees that the new value in column "Message" has no duplicates
    And user sees value: "setup indicator robot begin" in the "Message" column on the "Product Logs" table
    And user sees value: "R:1217:test_indicator_robot.TestIndicatorRobot" in the "Actor Key" column on the "Product Logs" table
    And user sees value: "robots" in the "Actor Group" column on the "Product Logs" table
    Then user sees that the first value in column "Time" has changed


  @clearIndexedDb
  Scenario: "Product Logs" tab. Checking the table update after scrolls down and robot startup
    And user "starts" the "TestIndicatorRobot" Robot
    And user "stops" the "TestIndicatorRobot" Robot
    And user remembers the first value in column "Time"
    When user scrolls "down" in the "Product Logs" table
    And user "stops" the "TestIndicatorRobot" Robot
    And user "starts" the "TestIndicatorRobot" Robot
    When user scrolls "up" in the "Product Logs" table
    And user sees that the new value in column "Message" has no duplicates
    And user sees value: "setup indicator robot begin" in the "Message" column on the "Product Logs" table
    And user sees value: "R:1217:test_indicator_robot.TestIndicatorRobot" in the "Actor Key" column on the "Product Logs" table
    And user sees value: "robots" in the "Actor Group" column on the "Product Logs" table
    Then user sees that the first value in column "Time" has changed


  @clearIndexedDb
  Scenario: "Product Logs" tab. Checking table update after config update
    And user remembers the first value in column "Message"
    And user remembers the first value in column "Time"
    And user selects "Herodotus" component from "Robots" table
    And user types a random value in the config for save
    When user clicks a Apply button
    And user sees the "Config updated successfully for trading_tasks(Herodotus)" success message
    And user clicks on the Server
    And user selects the "Product Logs" tab
    When user sees value: "trading_tasks.Herodotus updated" in the "Message" column on the "Product Logs" table
    And user sees value: "_" in the "Actor Key" column on the "Product Logs" table
    And user sees value: "coordinator" in the "Actor Group" column on the "Product Logs" table
    And user sees that the first value in column "Message" has changed
    Then user sees that the first value in column "Time" has changed


  @clearIndexedDb
  Scenario: "Product Logs" tab. Checking table update after creating a new account
    And user remembers the first value in column "Message"
    And user selects the "Real Accounts" tab
    And user clicks on the "New Real Account" button
    And user deletes the "Credentials" params from the modal
    And user types random "AutotestWithoutCredentialsAccount" value in the "Real Account Name" input
    And user types random "AutotestExchangeAccountID" value in the "Exchange Account ID" input
    When user clicks on the "Save" button in the "Creat Account" modal
    And user selects the "Product Logs" tab
    And user sees the created "New Real Account" in the "Message" column in the "Product Logs" table
    And user sees value: "created" in the "Message" column on the "Product Logs" table
    Then user sees that the first value in column "Message" has changed


  @clearIndexedDb
  Scenario: "Product Logs" tab. Checking table update after turning off the internet and starting the robot
    And user "starts" the "TestIndicatorRobot" Robot
    And user "stops" the "TestIndicatorRobot" Robot
    And user sees value: "Terminating→Disabled, details:" in the "Message" column on the "Product Logs" table
    And user remembers the first value in column "Message"
    And user remembers the first value in column "Time"
    When user sets the Internet off
    And user waits for "20" seconds
    When user sets the Internet on
    And user waits for "10" seconds
    And user "starts" the "TestIndicatorRobot" Robot
    And user sees that the new value in column "Message" has no duplicates
    And user sees value: "Terminating→Disabled, details:" in the "Message" column on the "Product Logs" table
    And user sees value: "setup indicator robot begin" in the "Message" column on the "Product Logs" table
    Then user sees that the first value in column "Time" has changed


  @clearIndexedDb
  Scenario: "Product Logs" tab. Checking table update after turning off the internet and config update
    And user remembers the first value in column "Time"
    And user selects "Herodotus" component from "Robots" table
    And user types a random value in the config for save
    And user clicks a Apply button
    When user sets the Internet off
    And user waits for "20" seconds
    And user sets the Internet on
    When user waits for "10" seconds
    And user clicks on the Server
    And user selects the "Product Logs" tab
    And user sees that the new value in column "Message" has no duplicates
    And user sees value: "trading_tasks.Herodotus updated" in the "Message" column on the "Product Logs" table
    Then user sees that the first value in column "Time" has changed

