import { Text } from '../../../../base/elements/text';
import { ETableBodySelectors, TableRow } from '../../../common/table/table.row';

export enum EInternalTransfersHistoryTableSelectors {
    StatusRowText = `${ETableBodySelectors.TableBody} [col-id="state"]`,
    MainAccountRowText = `${ETableBodySelectors.TableBody} [col-id="mainAccount"]`,
    SourceRowText = `${ETableBodySelectors.TableBody} [col-id="source"]`,
    DestinationRowText = `${ETableBodySelectors.TableBody} [col-id="destination"]`,
    AmountRowText = `${ETableBodySelectors.TableBody} [col-id="amount"]`,
    TransferIDRowText = `${ETableBodySelectors.TableBody} [col-id="transferID"]`,
    StateMessageRowText = `${ETableBodySelectors.TableBody} [col-id="stateMsg"]`,
}
class InternalTransfersHistoryTableRow extends TableRow {
    readonly statusRowText = new Text(EInternalTransfersHistoryTableSelectors.StatusRowText, false);
    readonly sourceRowText = new Text(EInternalTransfersHistoryTableSelectors.SourceRowText, false);
    readonly mainAccountRowText = new Text(
        EInternalTransfersHistoryTableSelectors.MainAccountRowText,
        false,
    );
    readonly destinationRowText = new Text(
        EInternalTransfersHistoryTableSelectors.DestinationRowText,
        false,
    );
    readonly amountRowText = new Text(EInternalTransfersHistoryTableSelectors.AmountRowText, false);
    readonly transferIDRowText = new Text(
        EInternalTransfersHistoryTableSelectors.TransferIDRowText,
        false,
    );
    readonly stateMessageRowText = new Text(
        EInternalTransfersHistoryTableSelectors.StateMessageRowText,
        false,
    );

    checkContainStatus(status: string) {
        this.checkContainTextInColumn(
            EInternalTransfersHistoryTableSelectors.StatusRowText,
            status,
        );
    }

    checkContainSource(source: string) {
        this.checkContainTextInColumn(
            EInternalTransfersHistoryTableSelectors.SourceRowText,
            source,
        );
    }

    checkContainAmount(stateMessage: string) {
        this.checkContainTextInColumn(
            EInternalTransfersHistoryTableSelectors.AmountRowText,
            stateMessage,
        );
    }
}

export const internalTransfersHistoryTableRow = new InternalTransfersHistoryTableRow();
