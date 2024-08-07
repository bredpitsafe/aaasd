import { Text } from '../../../../base/elements/text';
import { TDataTask } from '../../../../interfaces/backtesting/dataTack';
import { ETableBodySelectors, TableRow } from '../../../common/table/table.row';

export enum ERunsInfoTabTableRowSelectors {
    IdRunInfoRowText = '[class*="RunsInfoTab"] [col-id*="btRunNo_left"]',
    SimEndTimeRowText = '[class*="RunsInfoTab"] [col-id*="simulationEndTime_left"]',
    SimCurrentTimeRowText = '[class*="RunsInfoTab"] [col-id*="simulationTime_left"]',
    GroupRowText = '[class*="RunsInfoTab"] [col-id*="ag-Grid-AutoColumn"]',
    InstrumentRowText = '[class*="RunsInfoTab"] [col-id*="instrument"]',
    ScoreRowText = `[class*="RunsInfoTab"] ${ETableBodySelectors.TableBody} [col-id*="score"]`,
}

export class RunsInfoTabTableRow extends TableRow {
    readonly idRunInfoRowText = new Text(ERunsInfoTabTableRowSelectors.IdRunInfoRowText, false);
    readonly simEndTimeRowText = new Text(ERunsInfoTabTableRowSelectors.SimEndTimeRowText, false);

    readonly simCurrentTimeRowText = new Text(
        ERunsInfoTabTableRowSelectors.SimCurrentTimeRowText,
        false,
    );
    readonly groupRowText = new Text(ERunsInfoTabTableRowSelectors.GroupRowText, false);
    readonly instrumentRowText = new Text(ERunsInfoTabTableRowSelectors.InstrumentRowText, false);
    readonly scoreRowText = new Text(ERunsInfoTabTableRowSelectors.ScoreRowText, false);

    checkRunsInfoData(data: TDataTask): void {
        data.simEndTimes.forEach((simEndTime) => {
            this.simEndTimeRowText.checkContain(simEndTime);
            this.simCurrentTimeRowText.checkContain(simEndTime);
        });
        data.instruments.forEach((instrument) => this.instrumentRowText.checkContain(instrument));
    }
}

export const runsInfoTabTableRow = new RunsInfoTabTableRow();
