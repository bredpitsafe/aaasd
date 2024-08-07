Feature: e2e tests: "Herodotus robot" page test suit. I as User checks the functionality of "Add Task" tab of the "Herodotus" robot

  Background:
    Given user selects the "hypercube" server

  @clearIndexedDb
  Scenario: "Herodotus" robot. Start robot
    Given user goes on the "Trading Servers Manager" page with the selected "Active Tasks" tab in the "6017" robot
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user "starts" the "Autotest" Robot
    When user archive active tasks
#    And user selects the "Archived Tasks" tab on the "Trading Servers Manager" page
#    Then user deletes all archive tasks

