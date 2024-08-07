Feature: e2e tests: "TSM" page test suit. I as User checks the functionality of "Real Accounts" tap

  Background:
    Given user selects the "default" server

  @clearIndexedDb
  Scenario: Creating a new account without a "Credentials" params
    Given user goes on the "Trading Servers Manager" page with the selected "Real Accounts" tab
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user clicks on the "New Real Account" button
    And user deletes the "Credentials" params from the modal
    And user types random "AutotestWithoutCredentialsAccount" value in the "Real Account Name" input
    And user types random "AutotestExchangeAccountID" value in the "Exchange Account ID" input
    When user clicks on the "Save" button in the "Creat Account" modal
    Then user sees the "Real account created successfully" success message
    And user sees the inputted "User Name" and "User Exchange Account ID" in the table


  @clearIndexedDb
  Scenario Outline: Creating a new account with a "Credentials" params
    Given user goes on the "Trading Servers Manager" page with the selected "Real Accounts" tab
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user clicks on the "New Real Account" button
    And user types random "AutotestWithCredentialsAccount" value in the "Real Account Name" input
    And user types random "AutotestExchangeAccountID" value in the "Exchange Account ID" input
    And user sees "Save" button that is "disabled"
    And user types "Credentials" values:
      | name     | key     | secret     |  passphrase   |
      | <Name>   | <Key>   | <Secret>   |  <Passphrase> |
    When user clicks on the "Save" button in the "Creat Account" modal
    Then user sees the "Real account created successfully" success message

    Examples:
      | Name    | Key  | Secret  |  Passphrase  |
      | name    | key  | secret  |  passphrase  |


  @clearIndexedDb
  Scenario: Checking create and edit of a "Real Account" without a "Credentials" params
    Given user goes on the "Trading Servers Manager" page with the selected "Real Accounts" tab
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user clicks on the "New Real Account" button
    And user deletes the "Credentials" params from the modal
    And user types random "AutotestWithoutCredentialsAccount" value in the "Real Account Name" input
    And user types random "AutotestExchangeAccountID" value in the "Exchange Account ID" input
    And user clicks on the "Save" button in the "Creat Account" modal
    And user edits "User Name" and "User Exchange Account ID" inputs
    When user clicks on the "Save" button in the "Creat Account" modal
    And user sees the "Real account updated successfully" success message
    Then user sees the inputted "User Name" and "User Exchange Account ID" in the table


  @clearIndexedDb
  Scenario Outline: Checking create and edit of a Real Account with a "Credentials" params
    Given user goes on the "Trading Servers Manager" page with the selected "Real Accounts" tab
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user clicks on the "New Real Account" button
    And user types random "AutotestWithCredentialsAccount" value in the "Real Account Name" input
    And user types random "AutotestExchangeAccountID" value in the "Exchange Account ID" input
    And user types "Credentials" values:
      | name    | key    | secret    | passphrase    |
      | <Name>  | <Key>  | <Secret>  | <Passphrase>  |
    And user clicks on the "Save" button in the "Creat Account" modal
    And user edits "Credentials" values:
      | name         | key         | secret         | passphrase         |
      | <NameEdits>  | <KeyEdits>  | <SecretEdits>  | <PassphraseEdits>  |
    When user clicks on the "Save" button in the "Creat Account" modal
    And user sees the "Real account updated successfully" success message
    Then user sees "<NameEdits>" and "<KeyEdits>" values in the table

    Examples:
      | Name    | Key  | Secret  | Passphrase  | NameEdits  | KeyEdits  | SecretEdits  | PassphraseEdits  |
      | name    | key  | secret  | passphrase  | nameEdits  | keyEdits  | secretEdits  | passphraseEdits  |