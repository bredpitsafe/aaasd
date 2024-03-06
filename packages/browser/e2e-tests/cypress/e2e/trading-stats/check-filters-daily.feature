Feature: e2e tests: "Trading Stats" page test suit. I as User check functionality filters

  Background:
    Given user selects the "autotest" server
    Then user sets the "2100" to "1400" screen size

  @clearIndexedDb
  Scenario Outline: Check functionality "<NameFilter>" "<KindFilter>" filter in the in the "PNL", "ARB" tables on the "Daily" page
    Given user goes on the "2023-06-05" date the "Daily" page
    And user sees the "Daily" page of the "Trading Stats"
    And user sets "18477" in the "Backtesting ID" filter
    And user sees "sA,sB,sC" "Strategies" in the "PNL", "ARB" tables
    When user sets "<SetValue>" "<NameFilter>" in the "<KindFilter>" filter
    Then user sees "<SeeValue>" "Strategies" in the "PNL", "ARB" tables
    And user not sees "<NotSeeValue>" "Strategies" in the "PNL", "ARB" tables

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
  Scenario: Check functionality "Instruments" "Include" filter in the in the "PNL", "ARB" tables on the "Daily" page
    Given user goes on the "2023-06-05" date the "Daily" page
    And user sees the "Daily" page of the "Trading Stats"
    And user sets "18477" in the "Backtesting ID" filter
    And user sees "sA,sB,sC" "Strategies" in the "PNL", "ARB" tables
    When user sets "198208 | BinanceSpot | ETHEUR" "Instruments" in the "Include" filter
    Then user sees "sC" "Strategies" in the "PNL", "ARB" tables
    And user not sees "sA,sB" "Strategies" in the "PNL", "ARB" tables


  @clearIndexedDb
  Scenario: Check functionality "Instruments" "Exclude" filter in the in the "PNL", "ARB" tables on the "Daily" page
    Given user goes on the "2023-06-05" date the "Daily" page
    And user sees the "Daily" page of the "Trading Stats"
    And user sets "18477" in the "Backtesting ID" filter
    And user sees "sA,sB,sC" "Strategies" in the "PNL", "ARB" tables
    When user sets "198208 | BinanceSpot | ETHEUR" "Instruments" in the "Exclude" filter
    Then user sees "sB,sA" "Strategies" in the "PNL", "ARB" tables
    And user not sees "sC" "Strategies" in the "PNL", "ARB" tables


  @clearIndexedDb
  Scenario Outline: Check functionality "Strategies" "<KindFilter>" filter in the in the "Trades" table on the "Daily" page
    Given user goes on the "Daily" page in the "Trading Stats"
    Given user goes on the "2023-06-05" date the "Daily" page
    And user opens the "Trades" table
    And user sets "18477" in the "Backtesting ID" filter
    And user sees "sA,sB,sC" "Strategies" in the "Trades" table
    When user sets "<SetValue>" "Strategies" in the "<KindFilter>" filter
    Then user sees "<SeeValue>" "Strategies" in the "Trades" table
    And user not sees "<NotSeeValue>" "Strategies" in the "Trades" table

      Examples:
      | SetValue | SeeValue | NotSeeValue | KindFilter |
      | sA       | sA       | sB,sC       | Include    |
      | sC       | sA,sB    | sC          | Exclude    |


  @clearIndexedDb
  Scenario Outline: Check functionality "Base Assets" "<KindFilter>" filter in the "Trades" table on the "Daily" page
    Given user goes on the "2023-06-05" date the "Daily" page
    And user sees the "Daily" page of the "Trading Stats"
    And user opens the "Trades" table
    And user sets "18477" in the "Backtesting ID" filter
    And user sees "ETH,BTC" "Base Assets" in the "Trades" table
    When user sets "<SetValue>" "Base Assets" in the "<KindFilter>" filter
    Then user sees "<SeeValue>" "Base Assets" in the "Trades" table
    And user not sees "<NotSeeValue>" "Base Assets" in the "Trades" table

    Examples:
      | SetValue | SeeValue | NotSeeValue | KindFilter |
      | ETH      | ETH      | BTC         | Include    |
      | ETH      | BTC      | ETH         | Exclude    |


  @clearIndexedDb
  Scenario Outline: Check functionality "Quote Assets" "<KindFilter>" filter in the "Trades" table on the "Daily" page
    Given user goes on the "2023-06-05" date the "Daily" page
    And user sees the "Daily" page of the "Trading Stats"
    And user opens the "Trades" table
    And user sets "18477" in the "Backtesting ID" filter
    And user sees "EUR,USDT" "Quote Assets" in the "Trades" table
    When user sets "<SetValue>" "Quote Assets" in the "<KindFilter>" filter
    Then user sees "<SeeValue>" "Quote Assets" in the "Trades" table
    And user not sees "<NotSeeValue>" "Quote Assets" in the "Trades" table

    Examples:
      | SetValue | SeeValue | NotSeeValue | KindFilter |
      | EUR      | EUR      | USDT        | Include    |
      | EUR      | USDT     | EUR         | Exclude    |


  @clearIndexedDb
  Scenario Outline: Check functionality "Exchanges" "<KindFilter>" filter in the "Trades" table on the "Daily" page
    Given user goes on the "2023-06-05" date the "Daily" page
    And user sees the "Daily" page of the "Trading Stats"
    And user opens the "Trades" table
    And user sets "18477" in the "Backtesting ID" filter
    And user sees "BinanceSpot,BinanceSwap" "Exchanges" in the "Trades" table
    When user sets "<SetValue>" "Exchanges" in the "<KindFilter>" filter
    Then user sees "<SeeValue>" "Exchanges" in the "Trades" table
    And user not sees "<NotSeeValue>" "Exchanges" in the "Trades" table

    Examples:
      | SetValue    | SeeValue     | NotSeeValue  | KindFilter |
      | BinanceSwap | BinanceSwap  | BinanceSpot  | Include    |
      | BinanceSwap | BinanceSpot  | BinanceSwap  | Exclude    |


  @clearIndexedDb
  Scenario: Check functionality "Instruments" "Include" filter in the "Trades" tables on the "Daily" page
    Given user goes on the "2023-06-05" date the "Daily" page
    And user sees the "Daily" page of the "Trading Stats"
    And user sets "18477" in the "Backtesting ID" filter
    And user opens the "Trades" table
    And user sees "ETHEUR,BTCUSDT" "Instruments" in the "Trades" table
    When user sets "198208 | BinanceSpot | ETHEUR" "Instruments" in the "Include" filter
    Then user sees "ETHEUR" "Instruments" in the "Trades" table
    And user sees "BinanceSpot" "Exchanges" in the "Trades" table
    And user not sees "BTCUSDT" "Instruments" in the "Trades" table
    And user not sees "BinanceSwap" "Exchanges" in the "Trades" table


  @clearIndexedDb
  Scenario: Check functionality "Instruments" "Exclude" filter in the "Trades" tables on the "Daily" page
    Given user goes on the "2023-06-05" date the "Daily" page
    And user sees the "Daily" page of the "Trading Stats"
    And user sets "18477" in the "Backtesting ID" filter
    And user opens the "Trades" table
    And user sees "ETHEUR,BTCUSDT" "Instruments" in the "Trades" table
    When user sets "198208 | BinanceSpot | ETHEUR" "Instruments" in the "Exclude" filter
    Then user sees "BTCUSDT" "Instruments" in the "Trades" table
    And user sees "BinanceSwap" "Exchanges" in the "Trades" table
    And user not sees "ETHEUR" "Instruments" in the "Trades" table

