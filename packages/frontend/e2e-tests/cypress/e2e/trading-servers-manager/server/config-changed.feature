Feature: e2e tests: "TSM" page test suit. I as User checks the functionality of "Config" tab

  Background:
    Given user selects the "default" server

  @clearIndexedDb
  Scenario Outline: Verify run after setting up an "<KindAccount>" account
    Given user goes on the "Trading Servers Manager" page with selected "Config" tab of the "BinanceSpot" "Gate"
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user "stops" the "Binance" "Exec Gates"
    When user sets a "<KindAccount>" account in the config
    And user sees the "Config for gate(104) updated" success message
    And user "starts" the "Binance" "Exec Gates"
    When user sees the "<KindIcon>" icon near the name "Binance"
    Then user sees the "<KindStatus>" status near the name "BinanceSpot" in the "Exec Gates" table
    And user "stops" the "Binance" "Exec Gates"

    Examples:
      | KindAccount   | KindIcon  | KindStatus |
      | non-existing  | failed    | Close      |
      | existing      | enabled   | Play       |

