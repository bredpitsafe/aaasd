import { testSelector } from '../../../../index';

const INPUT = testSelector('credentialsInput');

export const ERealAccountsNewAccountSelectors = <const>{
    NameInput: 'nameInput',
    InternalSwitch: 'internalSwitch',
    CredentialsInternalSwitch: 'credentialsInternalSwitch',
    ExchangeAccountIDInput: 'exchangeAccountIDInput',
    DeleteCredentialsButton: 'deleteCredentialsButton',
    CredentialsInput: 'credentialsInput',
    CredentialsNameInput: `${INPUT}[placeholder="Name"]`,
    CredentialsKeyInput: `${INPUT}[placeholder="Key"]`,
    CredentialsSecretInput: `${INPUT}[placeholder="Secret"]`,
    CredentialsSecretEditInput: `${INPUT}[placeholder="Secret (already saved)"]`,
    CredentialsPassphraseInput: `${INPUT}[placeholder="Passphrase"]`,
    CredentialsPassphraseEditInput: `${INPUT}[placeholder="Passphrase (already saved)"]`,
    CredentialsArrow: '[class=ant-modal-content] [class=ant-collapse-expand-icon]',
    AddCredentialsButton: 'addCredentialsButton',
};
