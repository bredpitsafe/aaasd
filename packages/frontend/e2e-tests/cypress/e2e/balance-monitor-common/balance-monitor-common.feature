Feature: e2e tests: "Balance Monitor" page test suit. I as User checks the functionality of "Balance Monitor" page

  Background:
    Given user selects the "atf-dev" server
    Then user sets the "2100" to "1400" screen size

  @clearIndexedDb
  Scenario: Checking the "Balance Monitor" page opening
    Given user goes to the "Balance Monitor" page with the backend server parameter
    And user sees the "Authorization" page and logs in as a "Frontend" user
    When user sees the "Balance Monitor" page
    Then user sees tabs on the "Balance Monitor" page


  @clearIndexedDb
  Scenario: Checking the selection of pages in the menu
    Given user goes to the "Balance Monitor" page with the backend server parameter
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user sees the "Balance Monitor" page
    When user clicks the "Internal Transfers" button in the menu "Balance Monitor"
    And user sees the "Internal Transfers" page of the "Balance Monitor"
    When user clicks the "Transfer Blocking Rules" button in the menu "Balance Monitor"
    And user sees the "Transfer Blocking Rules" page of the "Balance Monitor"
    When user clicks the "Amount Limits Rules" button in the menu "Balance Monitor"
    And user sees the "Amount Limits Rules" page of the "Balance Monitor"
    When user clicks the "Auto Transfer Rules" button in the menu "Balance Monitor"
    And user sees the "Auto Transfer Rules" page of the "Balance Monitor"
    And user clicks the "Balance Monitor" button in the menu "Balance Monitor"
    Then user sees the "Balance Monitor" page of the "Balance Monitor"


  @clearIndexedDb
  Scenario Outline: Checking visible the "<NameTab>" tab
    Given user goes to the "Balance Monitor" page with the backend server parameter
    Given user goes to the "Balance Monitor" page on the "<NameTab>" tab with the backend server parameter
    And user sees the "Authorization" page and logs in as a "Frontend" user
    Then user sees the "<NameTab>" tab in the "Balance Monitor" page

    Examples:
      | NameTab                |
      | Manual Transfer        |
      | Send data to analyse   |
      | Distribution           |
      | Gathering              |


  @clearIndexedDb
  Scenario: Checking the visibility of the graph in the "Distribution" tab
    Given user goes to the "Balance Monitor" page on the "Distribution" tab with the backend server parameter
    And user sees the "Authorization" page and logs in as a "Frontend" user
    Then user sees the "Distribution" tab in the "Balance Monitor" page
    And user selects a coin "AAA" in the "Distribution" tab
    Then user sees a graph in the "Distribution" tab"
    And user not sees the label "Coin not selected"


  @clearIndexedDb
  Scenario Outline: "Send data to analyse" tab. Checking the functionality of the "Clear" button
    Given user goes to the "Balance Monitor" page on the "Send data to analyse" tab with the backend server parameter
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user sees the "Send data to analyse" tab in the "Balance Monitor" page
    And user sees not active "Send" button in the "Send data to analyse" form
    And user selects send data type values:
      | coin    | comment    |
      | <Coin>  | <Comment>  |
    When user sees active "Send" button in the "Send data to analyse" form
    And user clicks a "Clear" button in the "Send data to analyse" form
    And user sees not active "Send" button in the "Send data to analyse" form
    Then user not sees data on the "Send data to analyse" form
      | coin    | comment    |
      | <Coin>  | <Comment>  |

    Examples:
      | Coin | Comment  |
      | AAA  | comment  |


  @clearIndexedDb
  Scenario Outline: "Send data to analyse" tab. Checking the sending of data for analysis
    Given user goes to the "Balance Monitor" page on the "Send data to analyse" tab with the backend server parameter
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user sees the "Send data to analyse" tab in the "Balance Monitor" page
    And user sees not active "Send" button in the "Send data to analyse" form
    And user selects send data type values:
      | coin    | comment    |
      | <Coin>  | <Comment>  |
    When user clicks a "Send" button in the "Send data to analyse" form
    Then user sees the "Coin state saved successfully" success message
    And user not sees data on the "Send data to analyse" form
      | coin    | comment    |
      | <Coin>  | <Comment>  |

    Examples:
      | Coin | Comment  |
      | AAA  | comment  |


  @clearIndexedDb
  Scenario Outline: "Gathering" tab. Checking the coin display on the button
    Given user goes to the "Balance Monitor" page on the "Gathering" tab with the backend server parameter
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user sees the "Gathering" tab in the "Balance Monitor" page
    And user sees not active "Stop collecting" button in the "Gathering" form
    When user select the "<CoinOne>" coin in the collection
    And user sees active "Stop collecting" button in the "Gathering" form
    And user sees that the collection button contains the "<CoinOne>" coin
    When user select the "<CoinTwo>" coin in the collection
    And user sees that the collection button contains the "<CoinTwo>" coin
    And user clicks a "Clear" button in the "Gathering" form
    Then user not sees data on the "Gathering" form

    Examples:
      | CoinOne | CoinTwo |
      | YYY     | ZZZ     |


  @clearIndexedDb
  Scenario Outline: "Gathering" tab. Checking the functionality of the "Clear" button
    Given user goes to the "Balance Monitor" page on the "Gathering" tab with the backend server parameter
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user sees the "Gathering" tab in the "Balance Monitor" page
    And user selects gathering type values:
      | coin    | amount    |
      | <Coin>  | <Amount>  |
    And user sees data on the "Gathering" form
    And user sees active "Collect" button in the "Gathering" form
    When user clicks a "Clear" button in the "Gathering" form
    And user sees not active "Collect" button in the "Gathering" form
    Then user not sees data on the "Gathering" form

    Examples:
      | Coin | Amount   |
      | ZZZ  | 4.1201   |


  @clearIndexedDb
  Scenario Outline: "Gathering" tab. Checking the validation of the percent
    Given user goes to the "Balance Monitor" page on the "Gathering" tab with the backend server parameter
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user sees the "Gathering" tab in the "Balance Monitor" page
    And user selects gathering type values:
      | coin    | amount    |
      | <Coin>  | <Amount>  |
    And user sees data on the "Gathering" form
    And user types "<PercentOne>" in the "Percent" input in the "Gathering" form
    And user sees the "<SetPercentOne>" value in the "Gathering" form
    When user sees the "Amount should be greater then 0" error message in the "Gathering" form
    And user types "<PercentTwo>" in the "Percent" input in the "Gathering" form
    Then user sees the "<SetPercentTwo>" value in the "Gathering" form
    And user sees the "Start Gathering confirmation" modal

    Examples:
      | Coin | Amount   | PercentOne | SetPercentOne | PercentTwo | SetPercentTwo |
      | ZZZ  | 4.1201   | -5         | 0.0%          | 250        | 100.0%        |


  @clearIndexedDb
  Scenario Outline: "Gathering" tab. Checking the functionality of the "<NameButton>" button in the "Stop Gathering confirmation" modal
    Given user goes to the "Balance Monitor" page on the "Gathering" tab with the backend server parameter
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user sees the "Gathering" tab in the "Balance Monitor" page
    And user selects gathering type values:
      | coin    | amount    |
      | <Coin>  | <Amount>  |
    When user clicks a "Stop collecting" button in the "Gathering" form
    And user sees a modal to confirm the operation
    And user sees the "Stop Gathering confirmation" modal
    And user sees "<Coin>" in the "Stop Gathering confirmation" modal
    And user clicks on the "<NameButton>" button in the "Stop Gathering confirmation" modal
    Then user not sees the "Stop Gathering confirmation" modal

    Examples:
      | Coin | Amount   | NameButton  |
      | ZZZ  | 4.1201   | Close       |
      | ZZZ  | 4.1201   | Cancel      |


  @clearIndexedDb
  Scenario Outline: "Gathering" tab. Checking the functionality of the "<NameButton>" button in the "Start Gathering confirmation" modal
    Given user goes to the "Balance Monitor" page on the "Gathering" tab with the backend server parameter
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user sees the "Gathering" tab in the "Balance Monitor" page
    And user selects gathering type values:
      | coin    | amount    |
      | <Coin>  | <Amount>  |
    When user clicks a "Collect" button in the "Gathering" form
    And user sees a modal to confirm the operation
    And user sees the "Start Gathering confirmation" modal
    And user sees "<Coin>,<Amount>" in the "Start Gathering confirmation" modal
    And user clicks on the "<NameButton>" button in the "Start Gathering confirmation" modal
    Then user not sees the "Start Gathering confirmation" modal

    Examples:
      | Coin | Amount   | NameButton  |
      | ZZZ  | 4.1201   | Close       |
      | ZZZ  | 4.1201   | Cancel      |


  @clearIndexedDb
  Scenario Outline: "Gathering" tab. Checking the functionality the "Start Gathering"
    Given user goes to the "Balance Monitor" page on the "Gathering" tab with the backend server parameter
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user sees the "Gathering" tab in the "Balance Monitor" page
    And user selects gathering type values:
      | coin    | amount    |
      | <Coin>  | <Amount>  |
    When user clicks a "Collect" button in the "Gathering" form
    And user sees the "Start Gathering confirmation" modal
    And user clicks on the "OK" button in the "Start Gathering confirmation" modal
    Then user sees the "Gathering started successfully" success message
    And user not sees data on the "Gathering" form

    Examples:
      | Coin | Amount   |
      | ZZZ  | 4.1201   |


  @clearIndexedDb
  Scenario Outline: "Gathering" tab. Checking the functionality the "Stop Gathering"
    Given user goes to the "Balance Monitor" page on the "Gathering" tab with the backend server parameter
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user sees the "Gathering" tab in the "Balance Monitor" page
    And user selects gathering type values:
      | coin    | amount    |
      | <Coin>  | <Amount>  |
    When user clicks a "Stop collecting" button in the "Gathering" form
    And user sees the "Stop Gathering confirmation" modal
    And user clicks on the "OK" button in the "Stop Gathering confirmation" modal
    Then user sees the "Gathering stopped successfully" success message
    And user not sees data on the "Gathering" form

    Examples:
      | Coin | Amount   |
      | ZZZ  | 4.1201   |

