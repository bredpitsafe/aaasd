Feature: e2e tests: "Trading Stats" page test suit. I as User check functionality filter in the "ARB" table on the "Daily" page

  Background:
    Given user selects the "autotest" server
    Then user sets the "2100" to "1400" screen size

  @clearIndexedDb
  Scenario Outline: Check functionality "<KindFilter>" filter in the "ARB" table on the "Daily" page
    Given user goes on the "2023-06-05" date by "31734" "Backtesting ID" the "Daily" page with open the "PNL" tab
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user sees the "PNL" table in the "Trading Stats"
    And user is waiting for the data to load in the table
    And user types in the "<KindFilter>" filter values
      | strategies   | baseAssetsType | volumeAssetsType | anyAssetsType | exchangesType |
      | <Strategies> | <BaseAssets>   | <VolumeAssets>   | <AnyAssets>   | <Exchanges>   |
    And user types in the "170908 | BinanceSpot | BTCUSDC" instruments values in "<NameFilters>" selector
    When user clicks "Apply" button
    Then user sees "sA,sB,sC,sD" "Strategies" in the "PNL" table

    Examples:
      | KindFilter | Strategies | BaseAssets | VolumeAssets | AnyAssets | Exchanges   |
      | Include    | sA         | BTC        | USDC         | BTC       | BinanceSpot |
      | Exclude    | sA         | BTC        | USDC         | BTC       | BinanceSpot |


  @clearIndexedDb
  Scenario Outline: Check functionality "<NameFilter>" "<KindFilter>" filter in the "ARB" table on the "Daily" page
    Given user goes on the "2023-06-05" date by "31734" "Backtesting ID" the "Daily" page with open the "ARB" tab
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user sees the "ARB" table in the "Trading Stats"
    And user sees "sA,sB,sC,sD" "Strategies" in the "ARB" table
    When user sets "<SetValue>" "<NameFilter>" in the "<KindFilter>" filter
    Then user sees "<SeeValue>" "Strategies" in the "ARB" table
    And user not sees "<NotSeeValue>" "Strategies" in the "ARB" table

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
  Scenario: Check functionality "Instruments" "Include" filter in the "ARB" table on the "Daily" page
    Given user goes on the "2023-06-05" date by "31734" "Backtesting ID" the "Daily" page with open the "ARB" tab
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user sees the "ARB" table in the "Trading Stats"
    And user sees "sA,sB,sC,sD" "Strategies" in the "ARB" table
    When user sets "723408 | BybitSpot | ETHUSDT" "Instruments" in the "Include" filter
    Then user sees "sB" "Strategies" in the "ARB" table
    And user not sees "sA,sC,sD" "Strategies" in the "ARB" table


  @clearIndexedDb
  Scenario: Check functionality "Instruments" "Exclude" filter in the "ARB" tables on the "Daily" page
    Given user goes on the "2023-06-05" date by "31734" "Backtesting ID" the "Daily" page with open the "ARB" tab
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user sees the "ARB" table in the "Trading Stats"
    And user sees "sA,sB,sC,sD" "Strategies" in the "ARB" table
    When user sets "723408 | BybitSpot | ETHUSDT" "Instruments" in the "Exclude" filter
    Then user sees "sA,sC,sD" "Strategies" in the "ARB" table
    And user not sees "sB" "Strategies" in the "ARB" table

