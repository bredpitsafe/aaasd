Feature: e2e tests: "Trading Stats" page test suit. I as User check the functionality of the page

  Background:
    Given user selects the "autotest" server

  @clearIndexedDb
  Scenario Outline: Checking the saving of "<NameFilters>" filters on the "Daily" page after reload a page
    Given user goes on the "2023-06-05" date the "Daily" page
    And user sees the "Daily" page of the "Trading Stats"
    And user sets "<BacktestingId>" in the "Backtesting ID" filter
      | backtestingIdValue |
      | <BacktestingId>    |
    And user types in the "<NameFilters>" filter values
      | strategies   | baseAssetsType | quoteAssetsType | anyAssetsType | exchangesType |
      | <Strategies> | <BaseAssets>   | <QuoteAssets>   | <AnyAssets>   | <Exchanges>   |
    And user types in the "130308 | BinanceSpot | BTCUSDT" instruments values in "<NameFilters>" selector
    And user clicks "Apply" button
    When user reload a page
    And user waits for "5" seconds
    Then user sees the typed values in the filters
      | backtestingIdValue | strategies   | baseAssetsType | quoteAssetsType | anyAssetsType | exchangesType | instrumentsType |
      | <BacktestingId>    | <Strategies> | <BaseAssets>   | <QuoteAssets>   | <AnyAssets>   | <Exchanges>   | <Instruments>   |

    Examples:
      | NameFilters | BacktestingId | Strategies | BaseAssets | QuoteAssets | AnyAssets | Exchanges   | Instruments |
      | Include     | 18416         | sA         | BTC        | USDT        | USDC      | BinanceSpot | BTCUSDT     |
      | Include     | 18416         | sA         | BTC        | USDT        | USDC      | BinanceSpot | BTCUSDT     |


  @clearIndexedDb
  Scenario Outline: Checking the saving of "<NameFilters>" filters on the "Daily" page after reload a page
    Given user goes on the "2023-06-05" date the "Daily" page
    And user sees the "Daily" page of the "Trading Stats"
    And user sets "<BacktestingId>" in the "Backtesting ID" filter
      | backtestingIdValue |
      | <BacktestingId>    |
    And user types in the "<NameFilters>" filter values
      | strategies   | baseAssetsType | quoteAssetsType | anyAssetsType | exchangesType |
      | <Strategies> | <BaseAssets>   | <QuoteAssets>   | <AnyAssets>   | <Exchanges>   |
    And user types in the "130308 | BinanceSpot | BTCUSDT" instruments values in "<NameFilters>" selector
    And user clicks "Apply" button
    When user reload a page
    And user selects "Exclude" filter
    And user waits for "5" seconds
    Then user sees the typed values in the filters
      | backtestingIdValue | strategies   | baseAssetsType | quoteAssetsType | anyAssetsType | exchangesType | instrumentsType |
      | <BacktestingId>    | <Strategies> | <BaseAssets>   | <QuoteAssets>   | <AnyAssets>   | <Exchanges>   | <Instruments>   |

    Examples:
      | NameFilters | BacktestingId | Strategies | BaseAssets | QuoteAssets | AnyAssets | Exchanges   | Instruments |
      | Exclude     | 18416         | sA         | BTC        | USDT        | USDC      | BinanceSpot | BTCUSDT     |
      | Exclude     | 18416         | sA         | BTC        | USDT        | USDC      | BinanceSpot | BTCUSDT     |


  @clearIndexedDb
  Scenario Outline: Checking the saving of "<NameFilters>" filters on the "Monthly" page after reload a page
   Given user goes on the "2023-06-05 - 2023-06-30" date the "Monthly" page
    And user sees the "Monthly" page of the "Trading Stats"
    And user sets "<BacktestingId>" in the "Backtesting ID" filter
      | backtestingIdValue |
      | <BacktestingId>    |
    And user types in the "<NameFilters>" filter values
      | strategies   | baseAssetsType | quoteAssetsType | anyAssetsType | exchangesType |
      | <Strategies> | <BaseAssets>   | <QuoteAssets>   | <AnyAssets>   | <Exchanges>   |
    And user types in the "130308 | BinanceSpot | BTCUSDT" instruments values in "<NameFilters>" selector
    And user clicks "Apply" button
    When user reload a page
    And user waits for "5" seconds
    Then user sees the typed values in the filters
      | backtestingIdValue | strategies   | baseAssetsType | quoteAssetsType | anyAssetsType | exchangesType | instrumentsType |
      | <BacktestingId>    | <Strategies> | <BaseAssets>   | <QuoteAssets>   | <AnyAssets>   | <Exchanges>   | <Instruments>   |
    And user clicks "Reset" button
    Then user not sees the typed values in the filters
      | backtestingIdValue | strategies   | baseAssetsType | quoteAssetsType | anyAssetsType | exchangesType | instrumentsType |
      | <BacktestingId>    | <Strategies> | <BaseAssets>   | <QuoteAssets>   | <AnyAssets>   | <Exchanges>   | <Instruments>   |

    Examples:
      | NameFilters | BacktestingId | Strategies | BaseAssets | QuoteAssets | AnyAssets | Exchanges   | Instruments |
      | Include     | 18416         | sA         | USDT       | BTC         | USDC      | BinanceSpot | BTCUSDT     |
      | Include     | 18416         | sA         | USDT       | BTC         | USDC      | BinanceSpot | BTCUSDT     |


  @clearIndexedDb
  Scenario Outline: Checking the saving of "<NameFilters>" filters on the "Monthly" page after reload a page
    Given user goes on the "2023-06-05 - 2023-06-30" date the "Monthly" page
    And user sees the "Monthly" page of the "Trading Stats"
    And user sets "<BacktestingId>" in the "Backtesting ID" filter
      | backtestingIdValue |
      | <BacktestingId>    |
    And user types in the "<NameFilters>" filter values
      | strategies   | baseAssetsType | quoteAssetsType | anyAssetsType | exchangesType |
      | <Strategies> | <BaseAssets>   | <QuoteAssets>   | <AnyAssets>   | <Exchanges>   |
    And user types in the "130308 | BinanceSpot | BTCUSDT" instruments values in "<NameFilters>" selector
    And user clicks "Apply" button
    When user reload a page
    And user selects "Exclude" filter
    And user waits for "5" seconds
    Then user sees the typed values in the filters
      | backtestingIdValue | strategies   | baseAssetsType | quoteAssetsType | anyAssetsType | exchangesType | instrumentsType |
      | <BacktestingId>    | <Strategies> | <BaseAssets>   | <QuoteAssets>   | <AnyAssets>   | <Exchanges>   | <Instruments>   |
    And user clicks "Reset" button
    Then user not sees the typed values in the filters
      | backtestingIdValue | strategies   | baseAssetsType | quoteAssetsType | anyAssetsType | exchangesType | instrumentsType |
      | <BacktestingId>    | <Strategies> | <BaseAssets>   | <QuoteAssets>   | <AnyAssets>   | <Exchanges>   | <Instruments>   |

    Examples:
      | NameFilters | BacktestingId | Strategies | BaseAssets | QuoteAssets | AnyAssets | Exchanges   | Instruments |
      | Include     | 18416         | sA         | USDT       | BTC         | USDC      | BinanceSpot | BTCUSDT     |
      | Include     | 18416         | sA         | USDT       | BTC         | USDC      | BinanceSpot | BTCUSDT     |
