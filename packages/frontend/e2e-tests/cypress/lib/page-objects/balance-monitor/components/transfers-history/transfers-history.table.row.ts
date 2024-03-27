import { testSelector } from '@frontend/common/e2e';
import { ETransfersHistoryTabSelectors } from '@frontend/common/e2e/selectors/balance-monitor/components/transfers-history/transfer-history.tab.selectors';

import { getDataSuggestedTransfer } from '../../../../../support/data/balance-monitor/getDataSuggestedTransfer';
import { getDataTransfersHistory } from '../../../../../support/data/balance-monitor/getDataTransfersHistory';
import { dateChange } from '../../../../../support/data/date';
import { Text } from '../../../../base/elements/text';
import { ETableBodySelectors, TableRow } from '../../../common/table/table.row';
import { ETime } from '../../../common/time';

export enum ETransfersHistoryTableSelectors {
    StatusRowText = `${ETableBodySelectors.TableBody} [col-id="state"]`,
    SourceRowText = `${ETableBodySelectors.TableBody} [col-id="source"]`,
    DestinationRowText = `${ETableBodySelectors.TableBody} [col-id="destination"]`,
    AmountRowText = `${ETableBodySelectors.TableBody} [col-id="amount"]`,
    TxIDRowText = `${ETableBodySelectors.TableBody} [col-id="txid"]`,
    ExplorersRowText = `${ETableBodySelectors.TableBody} [col-id="txExplorers"]`,
    CreationModeRowText = `${ETableBodySelectors.TableBody} [col-id="createMode"]`,
}
class TransfersHistoryTableRow extends TableRow {
    readonly statusRowText = new Text(ETransfersHistoryTableSelectors.StatusRowText, false);
    readonly sourceRowText = new Text(ETransfersHistoryTableSelectors.SourceRowText, false);
    readonly destinationRowText = new Text(
        ETransfersHistoryTableSelectors.DestinationRowText,
        false,
    );
    readonly amountRowText = new Text(ETransfersHistoryTableSelectors.AmountRowText, false);
    readonly txIDRowText = new Text(ETransfersHistoryTableSelectors.TxIDRowText, false);
    readonly explorersRowText = new Text(ETransfersHistoryTableSelectors.ExplorersRowText, false);
    readonly creationModeRowText = new Text(
        ETransfersHistoryTableSelectors.CreationModeRowText,
        false,
    );

    checkDataTable() {
        const data = getDataTransfersHistory();
        this.createsRowText.checkContain(dateChange(ETime.Now));
        this.updateTimeRowText.checkContain(dateChange(ETime.Now));

        const propertiesToCheck = [
            'status',
            'coin',
            'source',
            'destination',
            'amount',
            'txID',
            'explorers',
        ];
        for (const row of propertiesToCheck) {
            this[`${row}RowText`].checkContain(data[row]);
        }
    }

    firstRightClick() {
        const data = getDataSuggestedTransfer();
        const tabSelector = ETransfersHistoryTabSelectors.TransfersHistoryTab;
        cy.get(testSelector(tabSelector)).within(() => {
            this.destinationRowText.get().contains(data.destination).first().rightclick();
        });
    }

    checkContainStatus(status: string) {
        this.checkContainTextInColumn(ETransfersHistoryTableSelectors.StatusRowText, status);
    }

    checkContainAmount(source: string) {
        this.checkContainTextInColumn(ETransfersHistoryTableSelectors.AmountRowText, source);
    }

    checkContainSource(stateMessage: string) {
        this.checkContainTextInColumn(ETransfersHistoryTableSelectors.SourceRowText, stateMessage);
    }

    checkContainDestination(stateMessage: string) {
        this.checkContainTextInColumn(
            ETransfersHistoryTableSelectors.DestinationRowText,
            stateMessage,
        );
    }
}

export const transfersHistoryTableRow = new TransfersHistoryTableRow();
