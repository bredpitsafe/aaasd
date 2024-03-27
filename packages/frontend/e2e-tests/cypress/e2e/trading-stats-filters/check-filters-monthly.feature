Feature: e2e tests: "Trading Stats" page test suit. I as User check functionality filters

  Background:
    Given user selects the "autotest" server

  @clearIndexedDb
  Scenario Outline: Check functionality "<NameFilter>" "<KindFilter>" filters on the "Monthly" page
    Given user goes on the "2023-06-05 - 2023-06-30" date the "Monthly" page
    And user sees the "Monthly" page of the "Trading Stats"
    And user sets "18477" in the "Backtesting ID" filter
    And user sees "sA,sB,sC" "Strategies" in the "Monthly Stats" table
    When user sets "<SetValue>" "<NameFilter>" in the "<KindFilter>" filter
    Then user sees "<SeeValue>" "Strategies" in the "Monthly Stats" table
    And user not sees "<NotSeeValue>" "Strategies" in the "Monthly Stats" table

    Examples:
      | NameFilter    | SetValue    | SeeValue | NotSeeValue | KindFilter |
      | Strategies    | sC          | sC       | sA,sB       | Include    |
      | Strategies    | sC          | sA,sB    | sC          | Exclude    |
      | Base Assets   | ETH         | sC       | sA,sB       | Include    |
      | Base Assets   | ETH         | sA,sB    | sC          | Exclude    |
      | Quote Assets  | EUR         | sC       | sA,sB       | Include    |
      | Quote Assets  | EUR         | sA,sB    | sC          | Exclude    |
      | Any Assets    | ETH         | sC       | sA,sB       | Include    |
      | Any Assets    | ETH         | sA,sB    | sC          | Exclude    |
      | Exchanges     | BinanceSwap | sB       | sA,sC       | Include    |
      | Exchanges     | BinanceSwap | sC,sA    | sB          | Exclude    |


  @clearIndexedDb
  Scenario: Check functionality filters on the "Monthly" page after reload a page
    Given user goes on the "2023-06-05 - 2023-06-30" date the "Monthly" page
    And user sees the "Monthly" page of the "Trading Stats"
    And user sets "18477" in the "Backtesting ID" filter
    And user sees "sA,sB,sC" "Strategies" in the "Monthly Stats" table
    When user sets "198208 | BinanceSpot | ETHEUR" "Instruments" in the "Include" filter
    Then user sees "sC" "Strategies" in the "Monthly Stats" table
    And user not sees "sA,sB" "Strategies" in the "Monthly Stats" table


  @clearIndexedDb
  Scenario: Check functionality filters on the "Monthly" page after reload a page
    Given user goes on the "2023-06-05 - 2023-06-30" date the "Monthly" page
    And user sees the "Monthly" page of the "Trading Stats"
    And user sets "18477" in the "Backtesting ID" filter
    And user sees "sA,sB,sC" "Strategies" in the "Monthly Stats" table
    When user sets "198208 | BinanceSpot | ETHEUR" "Instruments" in the "Exclude" filter
    Then user sees "sA,sB" "Strategies" in the "Monthly Stats" table
    And user not sees "sC" "Strategies" in the "Monthly Stats" table

