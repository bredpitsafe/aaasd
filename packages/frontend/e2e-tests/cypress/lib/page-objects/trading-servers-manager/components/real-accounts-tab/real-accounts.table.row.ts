import { Text } from '../../../../base/elements/text';
import { IAccount } from '../../../../interfaces/trading-servers-manager/acccount-interfaces';
import { ETableBodySelectors, TableRow } from '../../../common/table/table.row';

export enum ERealAccountsTableRowSelectors {
    ExchangeAccountIDText = `${ETableBodySelectors.TableBody} [col-id="exchangeAccountId"]`,
    NameRealAccountRowText = `[class=ag-full-width-container] ${ETableBodySelectors.TableBody} [col-id="name"]`,
    KeyRowText = `${ETableBodySelectors.TableBody} [col-id="key"]`,
    SecretRowText = `${ETableBodySelectors.TableBody} [col-id="secret"]`,
    PassphraseRowText = `${ETableBodySelectors.TableBody} [col-id="passphrase"]`,
}

export class RealAccountsTableRow extends TableRow {
    readonly exchangeAccountIDText = new Text(
        ERealAccountsTableRowSelectors.ExchangeAccountIDText,
        false,
    );
    readonly nameRealAccountRowText = new Text(
        ERealAccountsTableRowSelectors.NameRealAccountRowText,
        false,
    );
    readonly keyRowText = new Text(ERealAccountsTableRowSelectors.KeyRowText, false);
    readonly secretRowText = new Text(ERealAccountsTableRowSelectors.SecretRowText, false);
    readonly passphraseRowText = new Text(ERealAccountsTableRowSelectors.PassphraseRowText, false);

    checkFirstRowContainName(name: string): void {
        this.nameRowText.contains(name);
    }

    checkFirstRowContainExchangeAccountID(value: string): void {
        this.exchangeAccountIDText.contains(value);
    }

    doubleClickRowByName(name: string): void {
        this.nameRowText.get().contains(name).dblclick();
    }

    checkUserInTableRow(autotestAccount: IAccount): void {
        this.idRowText.get().contains(autotestAccount.idRealAccountRowText).should('be.visible');
        this.nameRowText
            .get()
            .contains(autotestAccount.userRealAccountNameRowText)
            .should('be.visible');
        this.exchangeAccountIDText
            .get()
            .contains(autotestAccount.exchangeAccountIDText)
            .should('be.visible');
    }

    checkCredentialInTableRow(autotestAccount: IAccount): void {
        this.nameRowText.get().contains(autotestAccount.nameRowText).should('be.visible');
        this.keyRowText.get().contains(autotestAccount.keyRowText).should('be.visible');
        this.secretRowText.get().contains(autotestAccount.secretRowText).should('be.visible');
        this.passphraseRowText
            .get()
            .contains(autotestAccount.passphraseRowText)
            .should('be.visible');
    }
}

export const realAccountsTableRow = new RealAccountsTableRow();
