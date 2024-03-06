Feature: e2e tests: "TSM" page test suit. I as User checks the functionality of "Instruments" tap

  Background:
    Given user selects the "default" server

  @clearIndexedDb
  Scenario: Checking the selection of the "Instruments" tab
    Given user goes to the "Trading Servers Manager" page with the backend server parameter
    And user sees the name "Servers" in the header
    When user selects the "Instruments" tab
    Then user sees the "Instruments" tab


  @clearIndexedDb
  Scenario Outline: Checking the functionality of the filter by name "<Name>"
    Given user goes on the "Trading Servers Manager" page with the selected "Instruments" tab
    When user types "<Name>" in the input field
    Then user sees "<Name>" names in the table

    Examples:
      | Name         |
      | XRPUSD_PERP  |
      | MATIC/USD    |
      | BTC          |


  @clearIndexedDb
  Scenario Outline: Checking the functionality of "Case Sensitive" button
    Given user goes on the "Trading Servers Manager" page with the selected "Instruments" tab
    When user types "<Name>" in the input field
    Then user sees "<NameSensitive>" names in the table
    And user clicks on the "Case Sensitive" switch button
    And user sees "<Name>" names in the table
    And user don't sees "<NameSensitive>" names in the table

    Examples:
      | Name       | NameSensitive |
      | nexousdt   | NEXOUSDT      |


  @clearIndexedDb
  Scenario: Checking that there is a notice "No Rows To Show"
    Given user goes on the "Trading Servers Manager" page with the selected "Instruments" tab
    When user types "X?@/Y" in the input field
    Then user sees "No Rows To Show" in the table


  @clearIndexedDb
  Scenario Outline: Checking the row download by "<NameButton>" button
    Given user goes on the "Trading Servers Manager" page with the selected "Instruments" tab
    When user types "CAKE3S_USDT" in the input field
    And user sees "CAKE3S_USDT" names in the table
    And user clicks on the "<NameButton>" button
    Then user sees the "<SuccessMessage>" success message
    And user checks the downloaded file with file "<NameFile>"

    Examples:
      | NameButton | SuccessMessage                           | NameFile                      |
      | CSV        | 1 table rows copied to clipboard as CSV  | instruments/instruments.csv   |
      | TSV        | 1 table rows copied to clipboard as TSV  | instruments/instruments.tsv   |
      | JSON       | 1 table rows copied to clipboard as JSON | instruments/instruments.json  |


  @clearIndexedDb
  Scenario Outline: Checking the functionality of the filter by name "<NameInstrument>" and redirect on the "<LintInstrument>" page
    Given user goes on the "Trading Servers Manager" page with the selected "Instruments" tab
    When user types "<NameInstrument>" in the input field
    And user sees "<NameInstrument>" names in the table
    Then user checks the "<LintInstrument>" link in the name

    Examples:
      | NameInstrument | LintInstrument                                        |
      | LAZIOTRY       | https://www.binance.com/en/trade/LAZIO_TRY            |
      | FOOTBALLUSDT   | https://www.binance.com/en/futures/FOOTBALLUSDT       |
      | ROOK/EUR       | https://trade.kraken.com/ru-ru/charts/KRAKEN:ROOK-EUR |
      | JARED_USDT     | https://poloniex.com/trade/JARED_USDT/?type=spot      |
      | POR-USDT       | https://www.okx.com/ru/trade-spot/por-usdt            |
      | STEEM_KRW      | https://en.bithumb.com/trade/order/STEEM_KRW          |
      | sprtusdt       | https://www.huobi.com/en-us/exchange/sprt_usdt        |
      | BTC-STORJ      | https://upbit.com/exchange?code=CRIX.UPBIT.BTC-STORJ  |
      | AVAX2LUSDT     | https://www.bybit.com/ru-RU/trade/spot/AVAX2L/USDT    |
      | GALAX3S-USDT   | https://www.kucoin.com/trade/GALAX3S-USDT             |
      | HOTCROSS_ETH   | https://www.gate.io/trade/HOTCROSS_ETH                |
      | LSETH-ETH      | https://exchange.coinbase.com/trade/LSETH-ETH         |

