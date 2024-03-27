import { EVirtualAccountsNewAccountSelectors } from '@frontend/common/e2e/selectors/trading-servers-manager/components/virtual-accounts-tab/virtual-accounts.new-account.modal.selectors';

import { Button } from '../../../../base/elements/button';
import { Input } from '../../../../base/elements/input';
import { SelectVirtualList } from '../../../../base/elements/selectVirtualList';
import { IAccount } from '../../../../interfaces/trading-servers-manager/acccount-interfaces';
import { NewAccountModal } from '../new-account.modal';

class VirtualAccountsNewAccountModal extends NewAccountModal {
    readonly nameInput = new Input(EVirtualAccountsNewAccountSelectors.NameInput);
    readonly realAccountsSelect = new SelectVirtualList(
        EVirtualAccountsNewAccountSelectors.RealAccountsSelect,
    );
    readonly deleteRealAccountsButton = new Button(
        EVirtualAccountsNewAccountSelectors.DeleteRealAccountsButton,
        false,
    );

    constructor() {
        super();
    }

    checkElementsExists(): void {
        super.checkElementsExists();
        this.nameInput.checkExists();
        this.realAccountsSelect.checkExists();
    }

    checkInputModal(autotestAccount: IAccount): void {
        this.nameInput.checkHaveValue(autotestAccount.userVirtualAccountNameRowText);
        this.realAccountsSelect.checkContain(autotestAccount.userRealAccountNameRowText);
    }
}

export const virtualAccountsNewAccountModal = new VirtualAccountsNewAccountModal();
