import { ERealAccountsTabSelectors } from '@frontend/common/e2e/selectors/trading-servers-manager/components/real-accounts-tab/real-accounts.tab.selectors';

import { Button } from '../../../../base/elements/button';
import { TableHeader } from '../../../common/table/table.header';

class RealAccountsTab extends TableHeader {
    readonly newRealAccountButton = new Button(ERealAccountsTabSelectors.NewRealAccountButton);

    checkElementsExists(): void {
        this.newRealAccountButton.checkExists();
    }

    checkHeaderTable(): void {
        for (const name of ['ID', 'Name', 'Exch. Acc. ID', 'Key', 'Secret', 'Passphrase']) {
            this.tableHeaderText.checkContain(name);
        }
    }
}

export const realAccountsTab = new RealAccountsTab();
