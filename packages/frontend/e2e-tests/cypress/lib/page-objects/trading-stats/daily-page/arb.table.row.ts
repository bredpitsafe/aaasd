import { getDataARBTable } from '../../../../support/data/trading-stats/daily/arbDailyTable';
import { Text } from '../../../base/elements/text';
import { ETableHeaderSelectors } from '../../common/table/table.header';
import { ETableBodySelectors, TableRow } from '../../common/table/table.row';
import { tradingStatsPage } from '../trading-stats.page';

const arbTableNameColumns = [
    'Strategy|Breakdown',
    'Exch./Asset',
    'Trades',
    'Volume $',
    'Last Trade',
    'Fees',
    'Taker %',
    'Taker %',
    'Maker V',
    'Taker V',
];

export enum EARBTableRowSelectors {
    StrategyRowText = `${ETableBodySelectors.TableBody} [col-id="ag-Grid-AutoColumn"]`,
    EntityNameRowText = `${ETableBodySelectors.TableBody} [col-id="entityName"]`,
    TradesTodayRowText = `${ETableBodySelectors.TableBody} [col-id="tradesToday"]`,
    VolumeUsdTodayRowText = `${ETableBodySelectors.TableBody} [col-id="volumeUsdToday"]`,
    LastTradeRowText = `${ETableBodySelectors.TableBody} [col-id="lastTrade"]`,
    FeesUsdRowText = `${ETableBodySelectors.TableBody} [col-id="feesUsd"]`,
    TakerPercentRowText = `${ETableBodySelectors.TableBody} [col-id="takerPercent"]`,
    MakerVolumeUsdRowText = `${ETableBodySelectors.TableBody} [col-id="makerVolumeUsd"]`,
    TakerVolumeUsdRowText = `${ETableBodySelectors.TableBody} [col-id="takerVolumeUsd"]`,
}

export class ARBTableRow extends TableRow {
    readonly strategyRowText = new Text(EARBTableRowSelectors.StrategyRowText, false);
    readonly entityNameRowText = new Text(EARBTableRowSelectors.EntityNameRowText, false);
    readonly tradesTodayRowText = new Text(EARBTableRowSelectors.TradesTodayRowText, false);
    readonly volumeUsdTodayRowText = new Text(EARBTableRowSelectors.VolumeUsdTodayRowText, false);
    readonly lastTradeRowText = new Text(EARBTableRowSelectors.LastTradeRowText, false);
    readonly feesUsdRowText = new Text(EARBTableRowSelectors.FeesUsdRowText, false);
    readonly takerPercentRowText = new Text(EARBTableRowSelectors.TakerPercentRowText, false);
    readonly makerVolumeUsdRowText = new Text(EARBTableRowSelectors.MakerVolumeUsdRowText, false);
    readonly takerVolumeUsdRowText = new Text(EARBTableRowSelectors.TakerVolumeUsdRowText, false);

    checkDataInARBTable(): void {
        const data = getDataARBTable();
        tradingStatsPage.openTableArrow.get().eq(0).click();
        this.strategyRowText.checkContain(data.strategy);
        this.entityNameRowText.checkContain(data.exchAsset);
        this.tradesTodayRowText.checkContain(data.trades);
        this.volumeUsdTodayRowText.checkContain(data.volume);
        this.lastTradeRowText.checkContain(data.lastTrade);
        this.feesUsdRowText.checkContain(data.fees);
        this.takerPercentRowText.checkContain(data.taker);
        this.makerVolumeUsdRowText.checkContain(data.makerV);
        this.takerVolumeUsdRowText.checkContain(data.takerV);
    }

    checkContainStrategy(nameStrategies: string[]): void {
        nameStrategies.forEach((nameStrategy) => this.strategyRowText.contains(nameStrategy));
    }

    checkNotContainStrategy(nameStrategies: string[]): void {
        nameStrategies.forEach((nameStrategy) =>
            this.strategyRowText.checkNotContain(nameStrategy),
        );
    }

    checkVisibleTable(): void {
        const selector = ETableHeaderSelectors.TableHeaderText;
        for (const value of arbTableNameColumns) {
            cy.contains(selector, value);
        }
    }
}

export const arbTableRow = new ARBTableRow();
