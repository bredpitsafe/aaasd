import { testSelector } from '@frontend/common/e2e';
import { ESuggestedTransfersTabSelectors } from '@frontend/common/e2e/selectors/balance-monitor/components/suggested-transfers/suggested-transfers.tab.selectors';

import { getDataSuggestedTransfer } from '../../../../../support/data/balance-monitor/getDataSuggestedTransfer';
import { Text } from '../../../../base/elements/text';
import { ETableBodySelectors, TableRow } from '../../../common/table/table.row';

export enum ESuggestedTransfersTableRowSelectors {
    AvailableRowText = `${ETableBodySelectors.TableBody} [col-id="available"]`,
    TransferAmountRowText = `${ETableBodySelectors.TableBody} [col-id="transfer-amount"]`,
    AccountRowText = `${ETableBodySelectors.TableBody} [col-id="percentage"]`,
    MinAmount = `${ETableBodySelectors.TableBody} [col-id="min-amount"]`,
    MaxAmount = `${ETableBodySelectors.TableBody} [col-id="max-amount"]`,
    WarningIcon = `${ETableBodySelectors.TableBody} [aria-label="warning"]`,
}

export class SuggestedTransfersTableRow extends TableRow {
    readonly availableRowText = new Text(
        ESuggestedTransfersTableRowSelectors.AvailableRowText,
        false,
    );
    readonly transferAmountRowText = new Text(
        ESuggestedTransfersTableRowSelectors.TransferAmountRowText,
        false,
    );
    readonly accountRowText = new Text(ESuggestedTransfersTableRowSelectors.AccountRowText, false);
    readonly sendButton = new Text(ESuggestedTransfersTabSelectors.SendButton);
    readonly resetButton = new Text(ESuggestedTransfersTabSelectors.ResetButton);
    readonly minAmount = new Text(ESuggestedTransfersTableRowSelectors.MinAmount, false);
    readonly maxAmount = new Text(ESuggestedTransfersTableRowSelectors.MaxAmount, false);
    readonly warningIcon = new Text(ESuggestedTransfersTableRowSelectors.WarningIcon, false);

    checkDataTable() {
        const data = getDataSuggestedTransfer();
        this.coinRowText.checkContain(data.coin);
        this.sourceRowText.checkContain(data.source);
        this.destinationRowText.checkContain(data.destination);
        this.availableRowText.checkContain(data.available);
        this.transferAmountRowText.checkContain(data.transferAmount);
        this.accountRowText.checkContain(data.account);
    }

    checkVisibleButtonTable() {
        this.sendButton.checkVisible();
        this.resetButton.checkVisible();
    }

    firstRightClick() {
        const tabSelector = ESuggestedTransfersTabSelectors.SuggestedTransfersTab;
        cy.get(testSelector(tabSelector)).within(() => {
            this.destinationRowText.get().first().rightclick();
        });
    }
}

export const suggestedTransfersTableRow = new SuggestedTransfersTableRow();
