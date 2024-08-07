Feature: e2e tests: "Trading Stats" page test suit. I as User check functionality "Excluded Strategies" setting filters

  Background:
    Given user selects the "autotest" server
    Then user sets the "2100" to "1400" screen size

  @clearIndexedDb
  Scenario Outline: Checking the set "<SetValue>" strategy in the "Excluded Strategies" setting on the "Daily" page
    Given user goes on the "2023-06-08" date by "30845" "Backtesting ID" the "Daily" page
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user sees the "Daily" page of the "Trading Stats"
    And user is waiting for the data to load in the table
    And user reset strategies in the "Excluded Strategies" setting
    And user sees "QuoteA,QuoteB,QuoteC" "Strategies" in the "PNL", "ARB" tables
    And user sees "QuoteA,QuoteB,QuoteC" "Strategies" in the "Trades" table
    When user sets the "<SetValue>" strategy in the "Excluded Strategies" setting
    And user sees "<SeeValue>" "Strategies" in the "PNL", "ARB" tables
    And user sees "<SeeValue>" "Strategies" in the "Trades" table
    When user not sees "<NotSeeValue>" "Strategies" in the "PNL", "ARB" tables
    And user not sees "<NotSeeValue>" "Strategies" in the "Trades" table
    When user sets "<SetFilterValue>" "Strategies" in the "<KindFilter>" filter
    And user sees "QuoteC" "Strategies" in the "PNL", "ARB" tables
    Then user sees "QuoteC" "Strategies" in the "Trades" table

    Examples:
      | SetValue      | SeeValue      | NotSeeValue    | SetFilterValue | KindFilter |
      | QuoteA        | QuoteC,QuoteB | QuoteA         | QuoteB        | Exclude    |
      | QuoteA,QuoteB | QuoteC        | QuoteA,QuoteB  | QuoteC         |Include    |


  @clearIndexedDb
  Scenario Outline:Checking that there is no excluded filter in the "<KindFilter>" filter list on the "Daily" page
    Given user goes on the "2023-06-08" date by "30847" "Backtesting ID" the "Daily" page
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user sees the "Daily" page of the "Trading Stats"
    And user is waiting for the data to load in the table
    And user reset strategies in the "Excluded Strategies" setting
    And user sees "BnQuoteA,BnQuoteB,BnQuoteC" "Strategies" in the "PNL", "ARB" tables
    And user sees "BnQuoteA,BnQuoteB,BnQuoteC" "Strategies" in the "Trades" table
    When user sets the "BnQuoteA" strategy in the "Excluded Strategies" setting
    Then user not sees "BnQuoteA" strategy in the "Strategies" "<KindFilter>" filter

    Examples:
      | KindFilter |
      | Include    |
      | Exclude    |


  @clearIndexedDb
  Scenario: Check functionality set and reset the "Excluded Strategies" setting on the "Daily" page
    Given user goes on the "2023-06-08" date by "30849" "Backtesting ID" the "Daily" page with open the "Trades" tab
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user sees the "Trades" table in the "Trading Stats"
    And user is waiting for the data to load in the table
    And user reset strategies in the "Excluded Strategies" setting
    And user sees "strategyA,strategyB,strategyC" "Strategies" in the "Trades" table
    When user sets the "strategyA,strategyB" strategy in the "Excluded Strategies" setting
    And user not sees "strategyA,strategyB" "Strategies" in the "Trades" table
    And user sees "strategyC" "Strategies" in the "Trades" table
    And user reset strategies in the "Excluded Strategies" setting
    Then user sees "strategyA,strategyB,strategyC" "Strategies" in the "Trades" table


  @clearIndexedDb
  Scenario: Checking whether the filter is saved after a redirect
    Given user goes on the "2023-06-08" date by "30849" "Backtesting ID" the "Daily" page with open the "Trades" tab
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user sees the "Trades" table in the "Trading Stats"
    And user is waiting for the data to load in the table
    And user reset strategies in the "Excluded Strategies" setting
    And user sees "strategyA,strategyB,strategyC" "Strategies" in the "Trades" table
    When user sets the "strategyA" strategy in the "Excluded Strategies" setting
    And user sees "strategyB,strategyC" "Strategies" in the "Trades" table
    And user not sees "strategyA" "Strategies" in the "Trades" table
    When user goes on the "2023-06-05" date by "30851" "Backtesting ID" the "Daily" page with open the "Trades" tab
    And user sees the "Trades" table in the "Trading Stats"
    And user sees "strategyB,strategyC" "Strategies" in the "Trades" table
    When user not sees "strategyA" "Strategies" in the "Trades" table
    And user clicks on the "Open settings" button in the menu
    Then user sees set the "strategyA" strategy in the "Excluded Strategies" setting


  @clearIndexedDb
  Scenario Outline: Checking the set "<SetValue>" strategy in the "Excluded Strategies" setting on the "Monthly" page
    Given user goes on the "2023-06-05 - 2023-06-05" date by "30853" "Backtesting ID" the "Monthly" page
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user sees the "Monthly" page of the "Trading Stats"
    And user is waiting for the data to load in the table
    And user reset strategies in the "Excluded Strategies" setting
    And user sees "StrA,StrB,StrC,StrD" "Strategies" in the "Monthly Stats" table
    When user sets the "<SetValue>" strategy in the "Excluded Strategies" setting
    When user sees "<SeeValue>" "Strategies" in the "Monthly Stats" table
    Then user not sees "<NotSeeValue>" "Strategies" in the "Monthly Stats" table

      Examples:
      | SetValue   | SeeValue   | NotSeeValue |
      | StrC,StrD  | StrA,StrB  | StrC,StrD   |
      | StrA,StrB  | StrC,StrD  | StrA,StrB   |


  @clearIndexedDb
  Scenario Outline: Checking that there is no excluded filter in the "<KindFilter>" filter list on the "Monthly" page
    Given user goes on the "2023-06-05 - 2023-06-05" date by "30855" "Backtesting ID" the "Monthly" page
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user sees the "Monthly" page of the "Trading Stats"
    And user is waiting for the data to load in the table
    And user reset strategies in the "Excluded Strategies" setting
    And user sees "BnStrategyA,BnStrategyB,BnStrategyC,BnStrategyD" "Strategies" in the "Monthly Stats" table
    When user sets the "BnStrategyC" strategy in the "Excluded Strategies" setting
    Then user not sees "BnStrategyC" strategy in the "Strategies" "<KindFilter>" filter

    Examples:
      | KindFilter |
      | Include    |
      | Exclude    |


  @clearIndexedDb
  Scenario: Check functionality set and reset the "Excluded Strategies" setting on the "Monthly" page
    Given user goes on the "2023-06-05 - 2023-06-05" date by "30857" "Backtesting ID" the "Monthly" page
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user sees the "Monthly" page of the "Trading Stats"
    And user is waiting for the data to load in the table
    And user reset strategies in the "Excluded Strategies" setting
    And user sees "StrategyBnQuoteA,StrategyBnQuoteB,StrategyBnQuoteC,StrategyBnQuoteD" "Strategies" in the "Monthly Stats" table
    When user sets the "StrategyBnQuoteB,StrategyBnQuoteD" strategy in the "Excluded Strategies" setting
    And user sees "StrategyBnQuoteA,StrategyBnQuoteC" "Strategies" in the "Monthly Stats" table
    And user not sees "StrategyBnQuoteB,StrategyBnQuoteD" "Strategies" in the "Monthly Stats" table
    When user reset strategies in the "Excluded Strategies" setting
    Then user sees "StrategyBnQuoteA,StrategyBnQuoteB,StrategyBnQuoteC,StrategyBnQuoteD" "Strategies" in the "Monthly Stats" table

