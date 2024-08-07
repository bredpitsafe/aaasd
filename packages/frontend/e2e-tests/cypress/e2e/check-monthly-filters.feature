Feature: e2e tests: "Trading Stats" page test suit. I as User check functionality filters on the "Monthly" page

  Background:
    Given user selects the "autotest" server

  @clearIndexedDb
  Scenario Outline: Check functionality "<NameFilter>" "<KindFilter>" filters on the "Monthly" page
    Given user goes on the "2023-06-05 - 2023-06-05" date by "31734" "Backtesting ID" the "Monthly" page
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user sees the "Monthly" page of the "Trading Stats"
    And user sees "sA,sB,sC,sD" "Strategies" in the "Monthly Stats" table
    When user sets "<SetValue>" "<NameFilter>" in the "<KindFilter>" filter
    And user is waiting for the data to load in the table
    Then user sees "<SeeValue>" "Strategies" in the "Monthly Stats" table
    And user not sees "<NotSeeValue>" "Strategies" in the "Monthly Stats" table

    Examples:
      | NameFilter    | SetValue    | SeeValue | NotSeeValue | KindFilter |
      | Strategies    | sC          | sC       | sA,sB,sD    | Include    |
      | Strategies    | sC          | sA,sB,sD | sC          | Exclude    |
      | Base Assets   | ETH         | sB,sD    | sA,sC       | Include    |
      | Base Assets   | ETH         | sA,sC    | sB,sD       | Exclude    |
      | Volume Assets | USDT        | sB,sD    | sA,sC       | Include    |
      | Volume Assets | USDT        | sA,sC    | sB,sD       | Exclude    |
      | Any Assets    | USDC        | sA       | sB,sC,sD    | Include    |
      | Any Assets    | USDC        | sB,sC,sD | sA          | Exclude    |
      | Exchanges     | BinanceSpot | sA       | sB,sC,sD    | Include    |
      | Exchanges     | BinanceSpot | sB,sC,sD | sA          | Exclude    |


  @clearIndexedDb
  Scenario: Check functionality filters on the "Monthly" page after reload a page
    Given user goes on the "2023-06-05 - 2023-06-05" date by "31734" "Backtesting ID" the "Monthly" page
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user sees the "Monthly" page of the "Trading Stats"
    And user sees "sA,sB,sC,sD" "Strategies" in the "Monthly Stats" table
    When user sets "170908 | BinanceSpot | BTCUSDC" "Instruments" in the "Include" filter
    And user is waiting for the data to load in the table
    Then user sees "sA" "Strategies" in the "Monthly Stats" table
    And user not sees "sB,sC,sD" "Strategies" in the "Monthly Stats" table


  @clearIndexedDb
  Scenario: Check functionality filters on the "Monthly" page after reload a page
    Given user goes on the "2023-06-05 - 2023-06-05" date by "31734" "Backtesting ID" the "Monthly" page
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user sees the "Monthly" page of the "Trading Stats"
    And user sees "sA,sB,sC,sD" "Strategies" in the "Monthly Stats" table
    When user sets "170908 | BinanceSpot | BTCUSDC" "Instruments" in the "Exclude" filter
    And user is waiting for the data to load in the table
    Then user sees "sB,sC,sD" "Strategies" in the "Monthly Stats" table
    And user not sees "sA" "Strategies" in the "Monthly Stats" table

