import { getDataFeesStatsTable } from '../../../../support/data/trading-stats/monthly/feesStatsTable';
import { getDataMakerTable } from '../../../../support/data/trading-stats/monthly/makerStatsTable';
import { getDataNovemberProfitsTable } from '../../../../support/data/trading-stats/monthly/months/profitsNovember';
import { getDataOctoberProfitsTable } from '../../../../support/data/trading-stats/monthly/months/profitsOctober';
import { getDataSeptemberProfitsTable } from '../../../../support/data/trading-stats/monthly/months/profitsSeptember';
import { getDataProfitsTable } from '../../../../support/data/trading-stats/monthly/profitsTable';
import { getDataTakerTable } from '../../../../support/data/trading-stats/monthly/takerStatsTable';
import { getDataVolumeTable } from '../../../../support/data/trading-stats/monthly/volumeStatsTable';
import { Text } from '../../../base/elements/text';
import { TMonthlyARBTableData } from '../../../interfaces/trading-stats/monthlyARBTableData';
import { TMonthlyProfitsTableData } from '../../../interfaces/trading-stats/monthlyProfitsTableData';
import { TMonthProfitsTableData } from '../../../interfaces/trading-stats/monthProfitsTableData';
import { ETableBodySelectors, TableRow } from '../../common/table/table.row';

export enum EMonthlyStatsTableRowSelectors {
    TableRowText = '[class*="ag-cell-value"]',
    StrategyRowText = `${ETableBodySelectors.TableBody} [col-id="ag-Grid-AutoColumn"]`,
    TotalRowText = `${ETableBodySelectors.TableBody} [col-id="total"]`,
    Jun05RowText = `${ETableBodySelectors.TableBody} [col-id="2023-06-05"]`,
}

export class MonthlyStatsTableRow extends TableRow {
    readonly tableRowText = new Text(EMonthlyStatsTableRowSelectors.TableRowText, false);
    readonly strategyRowText = new Text(EMonthlyStatsTableRowSelectors.StrategyRowText, false);
    readonly totalRowText = new Text(EMonthlyStatsTableRowSelectors.TotalRowText, false);
    readonly jun05RowText = new Text(EMonthlyStatsTableRowSelectors.Jun05RowText, false);

    constructor() {
        super();
    }

    checkDataInMonthlyStatsTable(nameTable: string): void {
        let data: TMonthlyARBTableData;
        switch (nameTable) {
            case 'ARB Volume':
                data = getDataVolumeTable();
                break;
            case 'ARB Maker':
                data = getDataMakerTable();
                break;
            case 'ARB Taker':
                data = getDataTakerTable();
                break;
            case 'ARB Fees':
                data = getDataFeesStatsTable();
                break;
        }
        this.strategyRowText.checkContain(data.strategy);
        this.nameRowText.checkContain(data.name);
        this.totalRowText.checkContain(data.total);
        this.jun05RowText.checkContain(data.jun05);
    }

    checkDataInProfitsTable(): void {
        const data: TMonthlyProfitsTableData = getDataProfitsTable();
        Object.values(data).forEach((value) => {
            this.tableRowText.contains(value);
        });
    }

    checkDataMonthInProfitsTable(nameMonth: string): void {
        let data: TMonthProfitsTableData;
        switch (nameMonth) {
            case 'September':
                data = getDataSeptemberProfitsTable();
                break;
            case 'October':
                data = getDataOctoberProfitsTable();
                break;
            case 'November':
                data = getDataNovemberProfitsTable();
                break;
        }
        Object.values(data).forEach((value) => {
            this.tableRowText.contains(value);
        });
    }

    checkContainStrategy(nameStrategies: string[]): void {
        nameStrategies.forEach((nameStrategy) => this.strategyRowText.contains(nameStrategy));
    }

    checkNotContainStrategy(nameStrategies: string[]): void {
        nameStrategies.forEach((nameStrategy) =>
            this.strategyRowText.checkNotContain(nameStrategy),
        );
    }
}

export const monthlyStatsTableRow = new MonthlyStatsTableRow();
