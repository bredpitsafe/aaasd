Feature: e2e tests: "WS Query Terminal" page test suit. I as User checks the functionality of "Request" tab

  Background:
    Given user selects the "default" server

  @clearIndexedDb
  Scenario: Checking of sending a "ConfigUpdate" request and receiving a response
    Given user goes to the "WS Query Terminal" page with the backend server parameter
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user clicks "Clear Unsaved" button in the "History" tab
    And user types an updated config request in the "Request" input
    When user clicks the "Run" button in the "Request" tab
    And user sees the "Done" status in the "Response" tab
    Then user sees the "ConfigUpdated" status in the "Response" tab


  @clearIndexedDb
  Scenario: Checking of sending a "ListInstances" request and receiving a response
    Given user goes to the "WS Query Terminal" page with the backend server parameter
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user clicks "Clear Unsaved" button in the "History" tab
    And user types "ListInstances" request in the "Request" input
    When user clicks the "Run" button in the "Request" tab
    And user sees the "Done" status in the "Response" tab
    Then user sees the "InstanceList" status in the "Response" tab


  @clearIndexedDb
  Scenario: Checking of sending a "StartComponent" request and receiving a response
    Given user goes to the "WS Query Terminal" page with the backend server parameter
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user clicks "Clear Unsaved" button in the "History" tab
    And user types "StartComponent" request in the "Request" input
    When user clicks the "Run" button in the "Request" tab
    And user sees the "Done" status in the "Response" tab
    Then user sees the "StartComponent" status in the "Response" tab

