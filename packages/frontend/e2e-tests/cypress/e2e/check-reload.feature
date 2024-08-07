Feature: e2e tests: "Trading Stats" page test suit. I as User check the functionality "saving of filters" after reload a page

  Background:
    Given user selects the "autotest" server

  @clearIndexedDb
  Scenario Outline: Checking the saving of "<NameFilters>" filters on the "Daily" page after reload a page
    Given user goes on the "2023-06-05" date the "Daily" page
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user sees the "Daily" page of the "Trading Stats"
    And user sets "<BacktestingId>" in the "Backtesting ID" filter
    And user is waiting for the data to load in the table
    And user types in the "<NameFilters>" filter values
      | strategies   | baseAssetsType | volumeAssetsType | anyAssetsType | exchangesType |
      | <Strategies> | <BaseAssets>   | <VolumeAssets>   | <AnyAssets>   | <Exchanges>   |
    And user types in the "130308 | BinanceSpot | BTCUSDT" instruments values in "<NameFilters>" selector
    And user clicks "Apply" button
    And user waits for "5" seconds
    When user reload a page
    And user waits for "5" seconds
    Then user sees the typed values in the filters
      | backtestingIdValue | strategies   | baseAssetsType | volumeAssetsType | anyAssetsType | exchangesType | instrumentsType |
      | <BacktestingId>    | <Strategies> | <BaseAssets>   | <VolumeAssets>   | <AnyAssets>   | <Exchanges>   | <Instruments>   |
    And user clicks "Reset" button
    Then user not sees the typed values in the filters
      | backtestingIdValue | strategies   | baseAssetsType | volumeAssetsType | anyAssetsType | exchangesType | instrumentsType |
      | <BacktestingId>    | <Strategies> | <BaseAssets>   | <VolumeAssets>   | <AnyAssets>   | <Exchanges>   | <Instruments>   |

    Examples:
      | NameFilters | BacktestingId | Strategies | BaseAssets | VolumeAssets | AnyAssets | Exchanges   | Instruments |
      | Include     | 31734         | sA         | BTC        | USDT         | USDC      | BinanceSpot | BTCUSDT     |


  @clearIndexedDb
  Scenario Outline: Checking the saving of "<NameFilters>" filters on the "Daily" page after reload a page
    Given user goes on the "2023-06-05" date the "Daily" page
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user sees the "Daily" page of the "Trading Stats"
    And user sets "<BacktestingId>" in the "Backtesting ID" filter
    And user is waiting for the data to load in the table
    And user types in the "<NameFilters>" filter values
      | strategies   | baseAssetsType | volumeAssetsType | anyAssetsType | exchangesType |
      | <Strategies> | <BaseAssets>   | <VolumeAssets>   | <AnyAssets>   | <Exchanges>   |
    And user types in the "130308 | BinanceSpot | BTCUSDT" instruments values in "<NameFilters>" selector
    And user clicks "Apply" button
    And user waits for "5" seconds
    When user reload a page
    And user selects "Exclude" filter
    And user waits for "5" seconds
    Then user sees the typed values in the filters
      | backtestingIdValue | strategies   | baseAssetsType | volumeAssetsType | anyAssetsType | exchangesType | instrumentsType |
      | <BacktestingId>    | <Strategies> | <BaseAssets>   | <VolumeAssets>   | <AnyAssets>   | <Exchanges>   | <Instruments>   |
    And user clicks "Reset" button
    Then user not sees the typed values in the filters
      | backtestingIdValue | strategies   | baseAssetsType | volumeAssetsType | anyAssetsType | exchangesType | instrumentsType |
      | <BacktestingId>    | <Strategies> | <BaseAssets>   | <VolumeAssets>   | <AnyAssets>   | <Exchanges>   | <Instruments>   |

    Examples:
      | NameFilters | BacktestingId | Strategies | BaseAssets | VolumeAssets | AnyAssets | Exchanges   | Instruments |
      | Exclude     | 31734         | sA         | BTC        | USDT         | USDC      | BinanceSpot | BTCUSDT     |


  @clearIndexedDb
  Scenario Outline: Checking the saving of "<NameFilters>" filters on the "Monthly" page after reload a pag
   Given user goes on the "2023-06-05 - 2023-06-30" date the "Monthly" page
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user sees the "Monthly" page of the "Trading Stats"
    And user sets "<BacktestingId>" in the "Backtesting ID" filter
    And user is waiting for the data to load in the table
    And user types in the "<NameFilters>" filter values
      | strategies   | baseAssetsType | volumeAssetsType | anyAssetsType | exchangesType |
      | <Strategies> | <BaseAssets>   | <VolumeAssets>   | <AnyAssets>   | <Exchanges>   |
    And user types in the "170908 | BinanceSpot | BTCUSDC" instruments values in "<NameFilters>" selector
    And user waits for "5" seconds
    And user clicks "Apply" button
    When user reload a page
    And user waits for "5" seconds
    Then user sees the typed values in the filters
      | backtestingIdValue | strategies   | baseAssetsType | volumeAssetsType | anyAssetsType | exchangesType | instrumentsType |
      | <BacktestingId>    | <Strategies> | <BaseAssets>   | <VolumeAssets>   | <AnyAssets>   | <Exchanges>   | <Instruments>   |
    And user clicks "Reset" button
    Then user not sees the typed values in the filters
      | backtestingIdValue | strategies   | baseAssetsType | volumeAssetsType | anyAssetsType | exchangesType | instrumentsType |
      | <BacktestingId>    | <Strategies> | <BaseAssets>   | <VolumeAssets>   | <AnyAssets>   | <Exchanges>   | <Instruments>   |

    Examples:
      | NameFilters | BacktestingId | Strategies | BaseAssets | VolumeAssets | AnyAssets | Exchanges   | Instruments |
      | Include     | 31734         | sA         | BTC        | USDC         | BTC       | BinanceSpot | BTCUSDC     |


  @clearIndexedDb
  Scenario Outline: Checking the saving of "<NameFilters>" filters on the "Monthly" page after reload a page
    Given user goes on the "2023-06-05 - 2023-06-30" date the "Monthly" page
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user sees the "Monthly" page of the "Trading Stats"
    And user sets "<BacktestingId>" in the "Backtesting ID" filter
    And user is waiting for the data to load in the table
    And user types in the "<NameFilters>" filter values
      | strategies   | baseAssetsType | volumeAssetsType | anyAssetsType | exchangesType |
      | <Strategies> | <BaseAssets>   | <VolumeAssets>   | <AnyAssets>   | <Exchanges>   |
    And user types in the "170908 | BinanceSpot | BTCUSDC" instruments values in "<NameFilters>" selector
    And user clicks "Apply" button
    And user waits for "5" seconds
    When user reload a page
    And user selects "Exclude" filter
    And user waits for "5" seconds
    Then user sees the typed values in the filters
      | backtestingIdValue | strategies   | baseAssetsType | volumeAssetsType | anyAssetsType | exchangesType | instrumentsType |
      | <BacktestingId>    | <Strategies> | <BaseAssets>   | <VolumeAssets>   | <AnyAssets>   | <Exchanges>   | <Instruments>   |
    And user clicks "Reset" button
    Then user not sees the typed values in the filters
      | backtestingIdValue | strategies   | baseAssetsType | volumeAssetsType | anyAssetsType | exchangesType | instrumentsType |
      | <BacktestingId>    | <Strategies> | <BaseAssets>   | <VolumeAssets>   | <AnyAssets>   | <Exchanges>   | <Instruments>   |

    Examples:
      | NameFilters | BacktestingId | Strategies | BaseAssets | VolumeAssets | AnyAssets | Exchanges   | Instruments |
      | Exclude     | 31734         | sA         | BTC        | USDC         | BTC       | BinanceSpot | BTCUSDC     |
