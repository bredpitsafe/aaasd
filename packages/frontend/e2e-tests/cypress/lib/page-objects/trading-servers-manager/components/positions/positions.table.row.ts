import { Text } from '../../../../base/elements/text';
import { ETableBodySelectors, TableRow } from '../../../common/table/table.row';
import { ETableRowSelectors } from '../../../common/table/table.row-selectors';

export enum ETableTabRowPositionsSelectors {
    PositionContractsRowText = `${ETableBodySelectors.TableBody} [col-id="position"]`,
}

export class PositionsTableRow extends TableRow {
    readonly robotIDRowText = new Text(ETableRowSelectors.RobotIDRowText, false);
    readonly robotNameRowText = new Text(ETableRowSelectors.RobotNameRowText, false);
    readonly positionContractsRowText = new Text(
        ETableTabRowPositionsSelectors.PositionContractsRowText,
        false,
    );

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

export const positionsTableRow = new PositionsTableRow();
