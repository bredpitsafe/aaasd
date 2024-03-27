Feature: e2e tests: "TSM" page test suit. I as User checks the functionality of "Config" tab

  Background:
    Given user selects the "qa" server

  @clearIndexedDb
  Scenario Outline: Verify run after setting up an "<KindAccount>" account
    Given user goes on the "Config" tab of the "BinanceSpot" "Gate"
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user "stops" the "BinanceSpot" "Exec Gates"
    And user types random the config input
    And user clicks a Apply button
    And user sees the "Config updated successfully for BinanceSpot(BinanceSpot)" success message
    And user waits for "5" seconds
    Then user sets a "<KindAccount>" account in the config
    And user clicks a Apply button
    And user sees the "Config updated successfully for BinanceSpot(BinanceSpot)" success message
    And user "starts" the "BinanceSpot" "Exec Gates"
    When user sees the "<KindIcon>" icon near the name "Binance"
    And user sees the "<KindStatus>" status near the name "BinanceSpot" in the "Exec Gates" table
    And user "stops" the "BinanceSpot" "Exec Gates"

    Examples:
      | KindAccount   | KindIcon  | KindStatus |
      | non-existing  | failed    | Close      |
      | existing      | enabled   | Play       |

