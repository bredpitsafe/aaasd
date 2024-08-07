import { Text } from '../../../../base/elements/text';
import { ETableBodySelectors, TableRow } from '../../../common/table/table.row';
import { ETableRowSelectors } from '../../../common/table/table.row-selectors';

export enum ETableTabRowBalancesSelectors {
    AssetIDRowText = `${ETableBodySelectors.TableBody} [col-id="assetId"]`,
    AssetRowText = `${ETableBodySelectors.TableBody} [col-id="assetName"]`,
    BalanceRowText = `${ETableBodySelectors.TableBody} [col-id="balance"]`,
}

export class BalancesTableRow extends TableRow {
    readonly robotIDRowText = new Text(ETableRowSelectors.RobotIDRowText, false);
    readonly robotNameRowText = new Text(ETableRowSelectors.RobotNameRowText, false);
    readonly assetIDRowText = new Text(ETableTabRowBalancesSelectors.AssetIDRowText, false);
    readonly assetRowText = new Text(ETableTabRowBalancesSelectors.AssetRowText, false);
    readonly balanceRowText = new Text(ETableTabRowBalancesSelectors.BalanceRowText, false);

    checkContainInstrumentId(instrumentId: string) {
        this.checkContainTextInColumn(ETableRowSelectors.InstrumentIdRowText, instrumentId);
    }
    checkContainInstrumentName(instrumentName: string) {
        this.checkContainTextInColumn(ETableRowSelectors.InstrumentRowText, instrumentName);
    }

    checkContainVirtualAccountID(virtualAccountID: string) {
        this.checkContainTextInColumn(ETableRowSelectors.VirtualAccountIDRowText, virtualAccountID);
    }

    checkContainVirtualAccountName(virtualAccountName: string) {
        this.checkContainTextInColumn(ETableRowSelectors.VirtualAccountRowText, virtualAccountName);
    }

    checkContainRobotID(robotID: string) {
        this.checkContainTextInColumn(ETableRowSelectors.RobotIDRowText, robotID);
    }

    checkContainRobotName(robotID: string) {
        this.checkContainTextInColumn(ETableRowSelectors.RobotNameRowText, robotID);
    }
}

export const balancesTableRow = new BalancesTableRow();
