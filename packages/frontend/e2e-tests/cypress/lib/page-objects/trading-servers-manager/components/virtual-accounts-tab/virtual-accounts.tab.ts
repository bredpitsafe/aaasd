import { EVirtualAccountsTabSelectors } from '@frontend/common/e2e/selectors/trading-servers-manager/components/virtual-accounts-tab/virtual-accounts.tab.selectors';

import { Button } from '../../../../base/elements/button';
import { customWait } from '../../../../web-socket/server';
import { TableHeader } from '../../../common/table/table.header';
import { tableRow } from '../../../common/table/table.row';
import { realAccountsTableRow } from '../real-accounts-tab/real-accounts.table.row';

class VirtualAccountsTab extends TableHeader {
    readonly newVirtualAccountButton = new Button(
        EVirtualAccountsTabSelectors.NewVirtualAccountButton,
    );

    checkElementsExists(): void {
        this.newVirtualAccountButton.checkExists();
    }

    checkUserHeaderTable(): void {
        this.tableHeaderText.get().contains('ID').should('exist');
        this.tableHeaderText.get().contains('Name').should('exist');
    }

    openVirtualAccount(): void {
        customWait(1);
        cy.get('@userVirtualName').then((object) => {
            const userVirtualName = object as unknown as string;
            this.virtualAccountInput.clearAndTypeText(userVirtualName);
            customWait(2);
            this.virtualAccountInput.type('{enter}');
            tableRow.nameRowText.get().contains(userVirtualName).should('be.visible');
        });
        tableRow.clickFirstArrow();
    }

    checkUserNameRowByIndexHaveText(indexRow: number, userName: string) {
        realAccountsTableRow.nameRealAccountRowText
            .get()
            .eq(indexRow)
            .should('have.text', userName);
    }
}

export const virtualAccountsTab = new VirtualAccountsTab();
