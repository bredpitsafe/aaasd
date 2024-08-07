Feature: e2e tests: "TSM" page test suit. I as User checks the functionality context menu Buttons

  Background:
    Given user selects the "default" server

  @clearIndexedDb
  Scenario: Checking visibility context menu of the "BinanceCoinSwap" Exec Gate
    Given user goes to the "Trading Servers Manager" page with the backend server parameter
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user selects "BinanceCoinSwap" component from "Exec Gates" table
    When user sees the context menu of the "BinanceCoinSwap" "Exec Gates" table


  @clearIndexedDb
  Scenario: Checking visibility context menu of the "BinanceCoinSwap" MD Gate
    Given user goes to the "Trading Servers Manager" page with the backend server parameter
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user selects "BinanceCoinSwap" component from "MD Gates" table
    When user sees the context menu of the "BinanceCoinSwap" "MD Gates" table


  @clearIndexedDb
  Scenario: Checking visibility context menu of the "TestMdIndicator" Robot
    Given user goes to the "Trading Servers Manager" page with the backend server parameter
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user selects "TestMdIndicator" component from "Robots" table
    When user sees the context menu of the "TestMdIndicator" "Robots" table


  @clearIndexedDb
  Scenario: Checking the operation context menu "BinanceCoinSwap" Exec Gate
    Given user goes to the "Trading Servers Manager" page with the backend server parameter
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user selects "BinanceCoinSwap" component from "Exec Gates" table
    When user "restart" the "BinanceCoinSwap" Exec Gate
    And user sees the "Component restarted successfully" success message
    When user "stops" the "BinanceCoinSwap" Exec Gate
    And user sees the "Component stopped successfully" success message
    And user sees the "Paused" status near the name "BinanceCoinSwap" in the "Exec Gates" table
    When user "starts" the "BinanceCoinSwap" Exec Gate
    And user sees the "Component started successfully" success message
    And user sees the "Play" status near the name "BinanceCoinSwap" in the "Exec Gates" table


  @clearIndexedDb
  Scenario: Checking the operation context menu "BinanceCoinSwap" MD Gate
    Given user goes to the "Trading Servers Manager" page with the backend server parameter
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user selects "BinanceCoinSwap" component from "MD Gates" table
    When user "restart" the "BinanceCoinSwap" MD Gate
    And user sees the "Component restarted successfully" success message
    When user "stops" the "BinanceCoinSwap" MD Gate
    And user sees the "Component stopped successfully" success message
    And user sees the "Paused" status near the name "BinanceCoinSwap" in the "MD Gates" table
    When user "starts" the "BinanceCoinSwap" MD Gate
    And user sees the "Component started successfully" success message
    And user sees the "Play" status near the name "BinanceCoinSwap" in the "MD Gates" table


  @clearIndexedDb
  Scenario: Checking the operation context menu "TestMdIndicator" Robot
    Given user goes to the "Trading Servers Manager" page with the backend server parameter
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user selects "TestMdIndicator" component from "Robots" table
    When user "restart" the "TestMdIndicator" Robot
    And user sees the "Component restarted successfully" success message
    When user "stops" the "TestMdIndicator" Robot
    And user sees the "Component stopped successfully" success message
    And user sees the "Paused" status near the name "TestMdIndicator" in the "Robots" table
    When user "starts" the "TestMdIndicator" Robot
    And user sees the "Component started successfully" success message
    And user sees the "Play" status near the name "TestMdIndicator" in the "Robots" table


  @clearIndexedDb
  Scenario: Checking the operation context menu "HerodotusMultiUnblock" Robot
    Given user goes to the "Trading Servers Manager" page with the backend server parameter
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user selects "HerodotusMultiUnblock" component from "Robots" table
    When user "unblock" the "HerodotusMultiUnblock" Robot
    And user sees the "Robot unblocked successfully" success message


  @clearIndexedDb
  Scenario: Checking the functionality a "Status Messages" tab
    Given user goes to the "Trading Servers Manager" page with the backend server parameter
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user selects "TestMdIndicator" component from "Robots" table
    And user "starts" the "TestMdIndicator" Robot
    When user selects the "Status Messages" tab on the "Trading Servers Manager" page
    And user sees the "Status Messages" tab in the "Trading Servers Manager" page
    And user sees a message "working" in the "Status Messages" tab
    And user "starts" the "Herodotus" Robot
    And user selects "Herodotus" component from "Robots" table
    Then user sees a new message in the "Status Messages" tab

