import { ERealAccountsNewAccountSelectors } from '@frontend/common/e2e/selectors/trading-servers-manager/components/real-accounts-tab/real-accounts.new-account.modal.selectors';

import { Button } from '../../../../base/elements/button';
import { Input } from '../../../../base/elements/input';
import { IAccount } from '../../../../interfaces/trading-servers-manager/acccount-interfaces';
import { NewAccountModal } from '../new-account.modal';
import { realAccountsTab } from './real-accounts.tab';

class RealAccountsNewAccountModal extends NewAccountModal {
    readonly nameInput = new Input(ERealAccountsNewAccountSelectors.NameInput);
    readonly internalSwitch = new Input(ERealAccountsNewAccountSelectors.InternalSwitch);
    readonly credentialsInternalSwitch = new Input(
        ERealAccountsNewAccountSelectors.CredentialsInternalSwitch,
    );
    readonly exchangeAccountIDInput = new Input(
        ERealAccountsNewAccountSelectors.ExchangeAccountIDInput,
    );
    readonly deleteCredentialsButton = new Button(
        ERealAccountsNewAccountSelectors.DeleteCredentialsButton,
    );
    readonly credentialsInput = new Input(ERealAccountsNewAccountSelectors.CredentialsInput);
    readonly credentialsNameInput = new Input(
        ERealAccountsNewAccountSelectors.CredentialsNameInput,
        false,
    );
    readonly credentialsKeyInput = new Input(
        ERealAccountsNewAccountSelectors.CredentialsKeyInput,
        false,
    );
    readonly credentialsSecretInput = new Input(
        ERealAccountsNewAccountSelectors.CredentialsSecretInput,
        false,
    );
    readonly credentialsSecretEditInput = new Input(
        ERealAccountsNewAccountSelectors.CredentialsSecretEditInput,
        false,
    );
    readonly credentialsPassphraseInput = new Input(
        ERealAccountsNewAccountSelectors.CredentialsPassphraseInput,
        false,
    );
    readonly credentialsPassphraseEditInput = new Input(
        ERealAccountsNewAccountSelectors.CredentialsPassphraseEditInput,
        false,
    );
    readonly credentialsArrow = new Button(
        ERealAccountsNewAccountSelectors.CredentialsArrow,
        false,
    );
    readonly addCredentialsButton = new Button(
        ERealAccountsNewAccountSelectors.AddCredentialsButton,
    );

    checkElementsExists(): void {
        super.checkElementsExists();
        this.nameInput.checkExists();
        this.exchangeAccountIDInput.checkExists();
        this.credentialsNameInput.checkExists();
        this.credentialsKeyInput.checkExists();
        this.credentialsSecretInput.checkExists();
        this.credentialsPassphraseInput.checkExists();
        this.addCredentialsButton.checkExists();
    }

    checkNotVisibleCredentialsInput(): void {
        this.credentialsNameInput.checkNotVisible();
        this.credentialsKeyInput.checkNotVisible();
        this.credentialsSecretInput.checkNotVisible();
        this.credentialsPassphraseInput.checkNotVisible();
    }

    checkInputModal(autotestAccount: IAccount): void {
        this.nameInput.checkHaveValue(autotestAccount.userRealAccountNameRowText);
        this.exchangeAccountIDInput.checkHaveValue(autotestAccount.exchangeAccountIDText);
        this.credentialsNameInput.checkHaveValue(autotestAccount.nameRowText);
        this.credentialsKeyInput.checkHaveValue(autotestAccount.keyRowText);
        this.credentialsSecretEditInput.checkExists();
        this.credentialsPassphraseEditInput.checkExists();
    }

    creatAccount(): void {
        realAccountsTab.newRealAccountButton.checkVisible();
        realAccountsTab.newRealAccountButton.click();
        realAccountsNewAccountModal.deleteCredentialsButton.click();
    }
}

export const realAccountsNewAccountModal = new RealAccountsNewAccountModal();
