Feature: e2e tests: "Trading Stats" page test suit. I as User check functionality filter in the "Trades" table on the "Daily" page

  Background:
    Given user selects the "autotest" server
    Then user sets the "2100" to "1400" screen size

  @clearIndexedDb
  Scenario Outline: Check functionality "Strategies" "<KindFilter>" filter in the "Trades" table on the "Daily" page
    Given user goes on the "2023-06-05" date by "31734" "Backtesting ID" the "Daily" page with open the "Trades" tab
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user sees the "Trades" table in the "Trading Stats"
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
    Given user goes on the "2023-06-05" date by "31734" "Backtesting ID" the "Daily" page with open the "Trades" tab
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user sees the "Trades" table in the "Trading Stats"
    And user sees "ETH,BTC" "Base Assets" in the "Trades" table
    When user sets "<SetValue>" "Base Assets" in the "<KindFilter>" filter
    Then user sees "<SeeValue>" "Base Assets" in the "Trades" table
    And user not sees "<NotSeeValue>" "Base Assets" in the "Trades" table

    Examples:
      | SetValue | SeeValue | NotSeeValue | KindFilter |
      | ETH      | ETH      | BTC         | Include    |
      | ETH      | BTC      | ETH         | Exclude    |


  @clearIndexedDb
  Scenario Outline: Check functionality "Volume Assets" "<KindFilter>" filter in the "Trades" table on the "Daily" page
    Given user goes on the "2023-06-05" date by "31734" "Backtesting ID" the "Daily" page with open the "Trades" tab
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user sees the "Trades" table in the "Trading Stats"
    And user sees "USDC,USDT" "Volume Assets" in the "Trades" table
    When user sets "<SetValue>" "Volume Assets" in the "<KindFilter>" filter
    Then user sees "<SeeValue>" "Volume Assets" in the "Trades" table
    And user not sees "<NotSeeValue>" "Volume Assets" in the "Trades" table

    Examples:
      | SetValue | SeeValue | NotSeeValue | KindFilter |
      | USDC     | USDC     | USDT        | Include    |
      | USDT     | USDC     | USDT        | Exclude    |


  @clearIndexedDb
  Scenario Outline: Check functionality "Exchanges" "<KindFilter>" filter in the "Trades" table on the "Daily" page
    Given user goes on the "2023-06-05" date by "31734" "Backtesting ID" the "Daily" page with open the "Trades" tab
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user sees the "Trades" table in the "Trading Stats"
    And user sees "BinanceSpot,BybitSpot" "Exchanges" in the "Trades" table
    When user sets "<SetValue>" "Exchanges" in the "<KindFilter>" filter
    Then user sees "<SeeValue>" "Exchanges" in the "Trades" table
    And user not sees "<NotSeeValue>" "Exchanges" in the "Trades" table

    Examples:
      | SetValue  | SeeValue    | NotSeeValue  | KindFilter |
      | BybitSpot | BybitSpot   | BinanceSpot  | Include    |
      | BybitSpot | BinanceSpot | BybitSpot    | Exclude    |


  @clearIndexedDb
  Scenario: Check functionality "Instruments" "Include" filter in the "Trades" tables on the "Daily" page
    Given user goes on the "2023-06-05" date by "31734" "Backtesting ID" the "Daily" page with open the "Trades" tab
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user sees the "Trades" table in the "Trading Stats"
    And user sees "BTCUSDC|BinanceSpot,ETHUSDT|BybitSpot" "Instruments" in the "Trades" table
    When user sets "723408 | BybitSpot | ETHUSDT" "Instruments" in the "Include" filter
    Then user sees "ETHUSDT|BybitSpot" "Instruments" in the "Trades" table
    And user sees "BybitSpot" "Exchanges" in the "Trades" table
    And user not sees "BTCUSDC|BinanceSpot" "Instruments" in the "Trades" table


  @clearIndexedDb
  Scenario: Check functionality "Instruments" "Exclude" filter in the "Trades" tables on the "Daily" page
    Given user goes on the "2023-06-05" date by "31734" "Backtesting ID" the "Daily" page with open the "Trades" tab
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user sees the "Trades" table in the "Trading Stats"
    And user sees "BTCUSDC|BinanceSpot,ETHUSDT|BybitSpot" "Instruments" in the "Trades" table
    When user sets "170908 | BinanceSpot | BTCUSDC" "Instruments" in the "Exclude" filter
    Then user sees "ETHUSDT|BybitSpot" "Instruments" in the "Trades" table
    And user sees "BybitSpot" "Exchanges" in the "Trades" table
    And user not sees "BTCUSDC|BinanceSpot" "Instruments" in the "Trades" table


  @clearIndexedDb
  Scenario: Checking the sets of a new filter after scrolls "down" the "Trades" table on the "Daily" page
    Given user goes on the "2023-06-05" date by "31734" "Backtesting ID" the "Daily" page with open the "Trades" tab
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user sees the "Trades" table in the "Trading Stats"
    When user sets "ETH" "Base Assets" in the "Include" filter
    And user sees "ETH" "Base Assets" in the "Trades" table
    And user not sees "BTC" "Base Assets" in the "Trades" table
    When user scrolls "down" in the "Trades" table
    And user sees "ETH" "Base Assets" in the "Trades" table
    And user not sees "BTC" "Base Assets" in the "Trades" table
    And user sees "BybitSpot" "Exchanges" in the "Trades" table
    And user not sees "BinanceSpot" "Exchanges" in the "Trades" table
    When user sets "BTC" "Base Assets" in the "Include" filter
    And user sees "BTC,ETH" "Base Assets" in the "Trades" table
    And user sees "BinanceSpot,BybitSpot" "Exchanges" in the "Trades" table
    Then user sets "BybitSpot" "Exchanges" in the "Include" filter
    And user sees "BybitSpot" "Exchanges" in the "Trades" table
    And user not sees "BinanceSpot" "Exchanges" in the "Trades" table


  @clearIndexedDb
  Scenario Outline: Checking the "<KindFilter>" filter reset in the "Trades" table on the "Daily" page
    Given user goes on the "2023-06-05" date by "31734" "Backtesting ID" the "Daily" page with open the "Trades" tab
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user sees the "Trades" table in the "Trading Stats"
    And user sees "sA,sB,sC" "Strategies" in the "Trades" table
    And user types in the "<KindFilter>" filter values
      | strategies   | baseAssetsType | volumeAssetsType | anyAssetsType | exchangesType |
      | <Strategies> | <BaseAssets>   | <VolumeAssets>   | <AnyAssets>   | <Exchanges>   |
    And user types in the "170908 | BinanceSpot | BTCUSDC" instruments values in "<KindFilter>" selector
    When user clicks "Apply" button
    And user sees "<SeeValue>" "Strategies" in the "Trades" table
    And user not sees "<NotSeeValue>" "Strategies" in the "Trades" table
    When the user resets all filters using the "close" icons
#    Then user sees "sA,sB,sC" "Strategies" in the "Trades" table https://bhft-company.atlassian.net/browse/FRT-2500

    Examples:
      | KindFilter | Strategies | BaseAssets | VolumeAssets | AnyAssets | Exchanges   | SeeValue | NotSeeValue |
      | Include    | sA         | BTC        | USDC         | BTC       | BinanceSpot | sA       | sB,sC,Sd    |

