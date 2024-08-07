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

const greenColor = 'rgb(56, 158, 13)';
const redColor = 'rgb(207, 19, 34)';
const blackBlueColor = 'rgb(105, 192, 255)';
const blueColor = 'rgb(125, 200, 255)';
const lightBlueColor = 'rgb(170, 219, 255)';

export enum EMonthlyStatsTableRowSelectors {
    TableRowText = '[class*="ag-cell-value"]',
    StrategyRowText = `${ETableBodySelectors.TableBody} [col-id="ag-Grid-AutoColumn"]`,
    TotalRowText = `${ETableBodySelectors.TableBody} [col-id="total"]`,
    Jun06RowText = `${ETableBodySelectors.TableBody} [col-id="2023-06-06"]`,
}

export class MonthlyStatsTableRow extends TableRow {
    readonly tableRowText = new Text(EMonthlyStatsTableRowSelectors.TableRowText, false);
    readonly strategyRowText = new Text(EMonthlyStatsTableRowSelectors.StrategyRowText, false);
    readonly totalRowText = new Text(EMonthlyStatsTableRowSelectors.TotalRowText, false);
    readonly jun06RowText = new Text(EMonthlyStatsTableRowSelectors.Jun06RowText, false);

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
        this.jun06RowText.checkContain(data.jun06);
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

    checkHaveColors(): void {
        const colorMap = [
            { backgroundColor: blackBlueColor, textColor: redColor },
            { backgroundColor: blueColor, textColor: redColor },
            { backgroundColor: lightBlueColor, textColor: greenColor },
            { backgroundColor: blackBlueColor, textColor: redColor },
        ];

        for (let i = 0; i < 4; i++) {
            this.jun06RowText
                .get()
                .eq(i)
                .should('have.css', 'background-color', colorMap[i].backgroundColor);
            this.jun06RowText
                .get()
                .eq(i)
                .find('span')
                .should('have.css', 'color', colorMap[i].textColor);
        }
    }
}

export const monthlyStatsTableRow = new MonthlyStatsTableRow();
