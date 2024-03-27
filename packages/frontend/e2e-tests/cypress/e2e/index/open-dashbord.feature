Feature: e2e tests: "TSM" page test suit. I as User checks the functionality on the "Dashboard" page

  Background:
    Given user selects the "default" server

  @clearIndexedDb
  Scenario: "Herodotus" robot. Checking the opening of the dashboard of "Robot"
    Given user goes on the "Dashboards" tab of the "HerodotusMulti" "Robot"
    And user sees the "Dashboards" tab
    And user types "T0925" in the input field
    When user gets URL the "Dashboard" page and opens the page
    And user sees the "Authorization" page and logs in as a "Frontend" user
    Then user sees labels and headers "RobotTaskDashboard" "Dashboard"


  @clearIndexedDb
  Scenario: "Indicators" tab. Checking the opening of the dashboard of one indicator
    Given user goes on the "Trading Servers Manager" page with the selected "Indicators" tab
    And user types "Hero.t_541.target_amount" in the input field
    And user sees "Hero.t_541.target_amount" names in the table
    And user selects a "First Row" that contains the name "robot.trading_tasks"
    When user gets URL the "Dashboard" page and opens the page
    And user sees the "Authorization" page and logs in as a "Frontend" user
    Then user sees the "Hero.t_541.target_amount:" indicator in the "Dashboard" page


  @clearIndexedDb
  Scenario: "Indicators" tab. Checking the opening of the dashboard of one indicator
    Given user goes on the "Trading Servers Manager" page with the selected "Indicators" tab
    And user clicks header table "Name" button
    And user types "Hero.t_541" in the input field
    And user sees "Hero.t_541" names in the table
    And user selects a "First Row" that contains the name "robot.trading_tasks"
    When user gets URL the "Button Dashboard" page and opens the page
    And user sees the "Authorization" page and logs in as a "Frontend" user
    Then user sees the "Hero.t_541.BTCUSDT|BinanceSwap.hero.bns.order_price:" indicator in the "Dashboard" page


  @clearIndexedDb
  Scenario: "Indicators" tab. Checking the opening of the dashboard of two indicators
    Given user goes on the "Trading Servers Manager" page with the selected "Indicators" tab
    And user clicks header table "Name" button
    And user types "Hero.t_541" in the input field
    And user sees "Hero.t_541" names in the table
    And user selects a "Two Rows" that contains the name "robot.trading_tasks"
    When user gets URL the "Button Dashboard" page and opens the page
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user sees the "Hero.t_541.BTCUSDT|BinanceSwap.hero.bns.order_price:" indicator in the "Dashboard" page
    Then user sees the "Hero.t_541.target_amount:" indicator in the "Dashboard" page


  @clearIndexedDb
  Scenario: "Indicators" tab. Checking the opening of the dashboard of six indicators
    Given user goes on the "Trading Servers Manager" page with the selected "Indicators" tab
    And user clicks header table "Name" button
    And user types "Hero.t_541" in the input field
    And user sees "Hero.t_541" names in the table
    And user selects a "All Rows" that contains the name "robot.trading_tasks"
    When user gets URL the "Button Dashboard" page and opens the page
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user sees the "Hero.t_541.BTCUSDT|BinanceSwap.hero.bns.order_price:" indicator in the "Dashboard" page
    And user sees the "Hero.t_541.BTCUSDT|BinanceSwap.hero.bns.trade:" indicator in the "Dashboard" page
    And user sees the "Hero.t_541.filled_amount:" indicator in the "Dashboard" page
    And user sees the "Hero.t_541.filled_amount.usd:" indicator in the "Dashboard" page
    And user sees the "Hero.t_541.min_price:" indicator in the "Dashboard" page
    Then user sees the "Hero.t_541.target_amount:" indicator in the "Dashboard" page