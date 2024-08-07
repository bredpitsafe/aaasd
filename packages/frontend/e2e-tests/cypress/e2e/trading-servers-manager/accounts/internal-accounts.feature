Feature: e2e tests: "TSM" page test suit. I as User checks the functionality of "Internal Accounts"

  Background:
    Given user selects the "default" server

  @clearIndexedDb
  Scenario: Checking the visibility of the "Flag must be enabled" error in the "Real Account" modal
    Given user goes on the "Trading Servers Manager" page with the selected "Real Accounts" tab
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user clicks on the "New Real Account" button
    And user deletes the "Credentials" params from the modal
    When user types random "internal.Autotest" value in the "Real Account Name" input
    And user sees "Save" button that is "disabled"
    When user clicks on the "Internal" switch in the "Real Account" modal
    And user sees "Save" button that is "enabled"
    When user not sees "Flag must be enabled when Name starts with `internal.`" in the "Account" modal
    And user clicks on the "Internal" switch in the "Real Account" modal
    Then user sees "Flag must be enabled when Name starts with `internal.`" in the "Account" modal
    And user sees "Save" button that is "disabled"


  @clearIndexedDb
  Scenario: Checking the visibility of the "Name must start with `internal." error in the "Real Account" modal
    Given user goes on the "Trading Servers Manager" page with the selected "Real Accounts" tab
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user clicks on the "New Real Account" button
    And user deletes the "Credentials" params from the modal
    And user types random "AutotestAccount" value in the "Real Account Name" input
    And user sees "Save" button that is "enabled"
    When user clicks on the "Internal" switch in the "Real Account" modal
    And user sees "Save" button that is "disabled"
    And user sees "Name must start with `internal.` when Internal flag is enabled" in the "Account" modal
    When user types random "internal.AutotestAccount" value in the "Real Account Name" input
    And user sees "Save" button that is "enabled"
    Then user not sees "Name must start with `internal.` when Internal flag is enabled" in the "Account" modal


  @clearIndexedDb
  Scenario Outline: Checking the visibility of the "Flag must be enabled" error in the "Credentials" params in the "Real Account" modal
    Given user goes on the "Trading Servers Manager" page with the selected "Real Accounts" tab
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user clicks on the "New Real Account" button
    And user types random "internal.Account" value in the "Real Account Name" input
    When user clicks on the "Internal" switch in the "Real Account" modal
    And user types "Credentials" values:
      | name    | key    | secret    | passphrase    |
      | <Name>  | <Key>  | <Secret>  | <Passphrase>  |
    And user sees "Save" button that is "disabled"
    When user not sees "Flag must be enabled when Name starts with `internal.`" in the "Account" modal
    And user clicks on the "Credentials Internal" switch in the "Real Account" modal
    And user sees "Save" button that is "enabled"
    And user clicks on the "Credentials Internal" switch in the "Real Account" modal
    And user sees "Save" button that is "disabled"
    When user sees "Flag must be enabled when Name starts with `internal.`" in the "Account" modal
    And user clicks on the "Credentials Internal" switch in the "Real Account" modal
    And user sees "Save" button that is "enabled"
    When user not sees "Flag must be enabled when Name starts with `internal.`" in the "Account" modal
    And user clicks on the "Internal" switch in the "Real Account" modal
    And user sees "Save" button that is "disabled"
    Then user sees "Flag must be enabled when Name starts with `internal.`" in the "Account" modal

    Examples:
      | Name           | Key             | Secret          | Passphrase |
      | internal.name  | InternalMarkets | InternalMarkets | passphrase |


  @clearIndexedDb
  Scenario Outline: Checking the visibility of the "Key, Secret must have value `InternalMarkets`" error in the "Credentials" params in the "Real Account" modal
    Given user goes on the "Trading Servers Manager" page with the selected "Real Accounts" tab
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user clicks on the "New Real Account" button
    And user clicks on the "Internal" switch in the "Real Account" modal
    And user types random "internal.Account" value in the "Real Account Name" input
    And user types "Credentials" values:
      | name    | key    | secret    | passphrase    |
      | <Name>  | <Key>  | <Secret>  | <Passphrase>  |
    And user sees "Save" button that is "enabled"
    When user clicks on the "Credentials Internal" switch in the "Real Account" modal
    Then user sees "Save" button that is "disabled"
    And user sees "Name must start with `internal.` when Internal flag is enabled" in the "Account" modal
    And user sees "Key must have value `InternalMarkets` when `Internal` flag is enabled" in the "Account" modal
    And user sees "Secret must have value `InternalMarkets` when `Internal` flag is enabled" in the "Account" modal
    When user types "Credentials" values:
      | name            | key           | secret           | passphrase   |
      | <NameEInternal> | <KeyInternal> | <SecretInternal> | <Passphrase> |
    And user sees "Save" button that is "enabled"
    And user not sees "Name must start with `internal.` when Internal flag is enabled" in the "Account" modal
    And user not sees "Key must have value `InternalMarkets` when `Internal` flag is enabled" in the "Account" modal
    Then user not sees "Secret must have value `InternalMarkets` when `Internal` flag is enabled" in the "Account" modal

    Examples:
      | Name  | Key | Secret | Passphrase | NameEInternal | KeyInternal     | SecretInternal  |
      | name  | key | secret | passphrase | internal.name | InternalMarkets | InternalMarkets |


  @clearIndexedDb
  Scenario Outline: Checking the visibility of the "internal account credential names must start with 'internal." error creat "Real Account"
    Given user goes on the "Trading Servers Manager" page with the selected "Real Accounts" tab
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user clicks on the "New Real Account" button
    And user clicks on the "Internal" switch in the "Real Account" modal
    And user types random "internal.Account" value in the "Real Account Name" input
    And user types "Credentials" values:
      | name    | key    | secret    | passphrase    |
      | <Name>  | <Key>  | <Secret>  | <Passphrase>  |
    When user sees "Save" button that is "enabled"
    And user clicks on the "Save" button in the "Creat Account" modal
    Then user sees the "internal account credential names must start with 'internal.'" notification message

    Examples:
      | Name  | Key | Secret | Passphrase |
      | name  | key | secret | passphrase |


  @clearIndexedDb
  Scenario Outline: Checking the visibility of the "internal account credential names must start with 'internal.' and have InternalMarkets credentials type" error creat "Real Account"
    Given user goes on the "Trading Servers Manager" page with the selected "Real Accounts" tab
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user clicks on the "New Real Account" button
    And user types random "Account" value in the "Real Account Name" input
    And user types "Credentials" values:
      | name             | key            | secret           | passphrase    |
      | <NameEInternal>  | <KeyInternal>  | <SecretInternal> | <Passphrase>  |
    When user clicks on the "Credentials Internal" switch in the "Real Account" modal
    And user clicks on the "Save" button in the "Creat Account" modal
    Then user sees the "internal account credential names must start with 'internal.'" notification message

    Examples:
      | NameEInternal | KeyInternal     | SecretInternal  | Passphrase  |
      | internal.name | InternalMarkets | InternalMarkets | passphrase  |


  @clearIndexedDb
  Scenario: Checking the visibility of the "Name must start with `internal." error in the "Virtual Account" modal
    Given user goes to the "Trading Servers Manager" page with the backend server parameter
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user selects the "Virtual Accounts" tab on the "Trading Servers Manager" page
    And user clicks on the "New Virtual Account" button
    And user types "Account" in the "Virtual Account Name" input
    And user types "AutotestRealAccount" in the "Real Accounts" input
    And user sees "Save" button that is "enabled"
    When user clicks on the "Internal" switch in the "Virtual Account" modal
    And user sees "Save" button that is "disabled"
    When user sees "Name must start with `internal.` when Internal flag is enabled" in the "Virtual Account" modal
    And user types random "internal.Account" in the "Virtual Account Name" input
    And user sees "Save" button that is "enabled"
    Then user not sees "Name must start with `internal.` when Internal flag is enabled" in the "Virtual Account" modal


  @clearIndexedDb
  Scenario: Checking the visibility of the "Flag must be enabled when Name starts with `internal.`" error in the "Virtual Account" modal
    Given user goes to the "Trading Servers Manager" page with the backend server parameter
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user selects the "Virtual Accounts" tab on the "Trading Servers Manager" page
    And user clicks on the "New Virtual Account" button
    And user types "internal.Account" in the "Virtual Account Name" input
    And user types "AutotestRealAccount" in the "Real Accounts" input
    And user sees "Save" button that is "disabled"
    When user clicks on the "Internal" switch in the "Virtual Account" modal
    And user not sees "Flag must be enabled when Name starts with `internal.`" in the "Virtual Account" modal
    And user sees "Save" button that is "enabled"
    When user clicks on the "Internal" switch in the "Virtual Account" modal
    Then user sees "Flag must be enabled when Name starts with `internal.`" in the "Virtual Account" modal
    And user sees "Save" button that is "disabled"


  @clearIndexedDb
  Scenario: Checking the visibility of the "internal virtual account must be linked only with internal real" error creat "Virtual Account" modal
    Given user goes to the "Trading Servers Manager" page with the backend server parameter
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user selects the "Virtual Accounts" tab on the "Trading Servers Manager" page
    And user clicks on the "New Virtual Account" button
    And user types "internal.Account" in the "Virtual Account Name" input
    And user types "AutotestRealAccount" in the "Real Accounts" input
    And user clicks on the "Internal" switch in the "Virtual Account" modal
    When user clicks on the "Save" button in the "Creat Account" modal
    Then user sees the "internal virtual account must be linked with only internal real accounts" notification message


  @clearIndexedDb
  Scenario: Checking the creation of a new internal "Real Account"
    Given user goes on the "Trading Servers Manager" page with the selected "Real Accounts" tab
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user clicks on the "New Real Account" button
    When user clicks on the "Internal" switch in the "Real Account" modal
    And user deletes the "Credentials" params from the modal
    And user types random "internal.AutotestAccount" value in the "Real Account Name" input
    When user clicks on the "Save" button in the "Creat Account" modal
    Then user sees the "Real account created successfully" success message


  @clearIndexedDb
  Scenario: Creating a new internal "Virtual Account" and connection for new internal "Real Account"
    Given user goes on the "Trading Servers Manager" page with the selected "Real Accounts" tab
    And user sees the "Authorization" page and logs in as a "Frontend" user
    And user clicks on the "New Real Account" button
    When user clicks on the "Internal" switch in the "Real Account" modal
    And user deletes the "Credentials" params from the modal
    And user types random "internal.Account" value in the "Real Account Name" input
    When user clicks on the "Save" button in the "Creat Account" modal
    And user sees the "Real account created successfully" success message
    And user selects the "Virtual Accounts" tab on the "Trading Servers Manager" page
    And user clicks on the "New Virtual Account" button
    When user types random "internal.Account" in the "Virtual Account Name" input
    And user selects new created "Account" in the "Real Accounts" section
    And user clicks on the "Internal" switch in the "Virtual Account" modal
    When user clicks on the "Save" button in the "Creat Account" modal
    Then user sees the "Virtual account created successfully" success message
    And user checks inputted "RealAccountName" and "VirtualAccountName" names

