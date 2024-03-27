import { Text } from '../../../../base/elements/text';
import { IAccount } from '../../../../interfaces/trading-servers-manager/acccount-interfaces';
import { ETableBodySelectors, TableRow } from '../../../common/table/table.row';

export enum EVirtualAccountsTableRowSelectors {
    IDRealAccountRowText = `[class=ag-full-width-container] ${ETableBodySelectors.TableBody} [col-id="id"]`,
}

export class VirtualAccountsTableRow extends TableRow {
    readonly idRealAccountRowText = new Text(
        EVirtualAccountsTableRowSelectors.IDRealAccountRowText,
        false,
    );

    checkUserInTableRow(autotestAccount: IAccount): void {
        this.idRowText.get().contains(autotestAccount.idVirtualAccountRowText).should('be.visible');
        this.nameRowText
            .get()
            .contains(autotestAccount.userVirtualAccountNameRowText)
            .should('be.visible');
    }

    checkRealAccountInTableRow(autotestAccount: IAccount): void {
        this.idRealAccountRowText
            .get()
            .contains(autotestAccount.idRealAccountRowText)
            .should('be.visible');
        this.nameRowText
            .get()
            .contains(autotestAccount.userRealAccountNameRowText)
            .should('be.visible');
    }
}

export const virtualAccountsTableRow = new VirtualAccountsTableRow();
