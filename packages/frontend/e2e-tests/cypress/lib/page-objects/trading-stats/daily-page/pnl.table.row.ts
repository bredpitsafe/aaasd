import { getDataPNLTable } from '../../../../support/data/trading-stats/daily/pnlDailyTable';
import { Text } from '../../../base/elements/text';
import { ETableHeaderSelectors } from '../../common/table/table.header';
import { ETableBodySelectors, TableRow } from '../../common/table/table.row';
import { tradingStatsPage } from '../trading-stats.page';

const pnlTableNameColumns = [
    'Strategy',
    'Name',
    'Bal. Start',
    'Bal. Now/End',
    'Δ Balance',
    'Δ Bal ($ equiv.)',
    'Δ USD est.',
    'Rate Start',
    'Rate End',
    'Δ Rate',
    'Δ Rate %',
];

export enum EPNLTableRowSelectors {
    StrategyRowText = `${ETableBodySelectors.TableBody} [col-id="ag-Grid-AutoColumn"]`,
    BalanceStartRowText = `${ETableBodySelectors.TableBody} [col-id="balanceStart"]`,
    BalanceEndRowText = `${ETableBodySelectors.TableBody} [col-id="balanceEnd"]`,
    DeltaBalanceRowText = `${ETableBodySelectors.TableBody} [col-id="deltaBalance"]`,
    DeltaBalanceUsdRowText = `${ETableBodySelectors.TableBody} [col-id="deltaBalanceUsd"]`,
    DeltaUSDRowText = `${ETableBodySelectors.TableBody} [col-id="deltaUsd"]`,
    RateStartRowText = `${ETableBodySelectors.TableBody} [col-id="rateStart"]`,
    RateEndRowText = `${ETableBodySelectors.TableBody} [col-id="rateEnd"]`,
    DeltaRateRowText = `${ETableBodySelectors.TableBody} [col-id="deltaRate"]`,
    DeltaRatePercentRowText = `${ETableBodySelectors.TableBody} [col-id="deltaRatePercent"]`,
}

export class PNLTableRow extends TableRow {
    readonly strategyRowText = new Text(EPNLTableRowSelectors.StrategyRowText, false);
    readonly balanceStartRowText = new Text(EPNLTableRowSelectors.BalanceStartRowText, false);
    readonly balanceEndRowText = new Text(EPNLTableRowSelectors.BalanceEndRowText, false);
    readonly deltaBalanceRowText = new Text(EPNLTableRowSelectors.DeltaBalanceRowText, false);
    readonly deltaBalanceUsdRowText = new Text(EPNLTableRowSelectors.DeltaBalanceUsdRowText, false);
    readonly deltaUSDRowText = new Text(EPNLTableRowSelectors.DeltaUSDRowText, false);
    readonly rateStartRowText = new Text(EPNLTableRowSelectors.RateStartRowText, false);
    readonly rateEndRowText = new Text(EPNLTableRowSelectors.RateEndRowText, false);
    readonly deltaRateRowText = new Text(EPNLTableRowSelectors.DeltaRateRowText, false);
    readonly deltaRatePercentRowText = new Text(
        EPNLTableRowSelectors.DeltaRatePercentRowText,
        false,
    );

    checkDataInPNLTable(): void {
        const data = getDataPNLTable();
        tradingStatsPage.openTableArrow.get().eq(0).click();
        this.strategyRowText.checkContain(data.strategy);
        this.nameRowText.checkContain(data.name);
        this.balanceStartRowText.checkContain(data.balStart);
        this.balanceEndRowText.checkContain(data.balNowEnd);
        this.deltaBalanceRowText.checkContain(data.balance);
        this.deltaBalanceUsdRowText.checkContain(data.balEquiv);
        this.deltaUSDRowText.checkContain(data.usdEst);
        this.rateStartRowText.checkContain(data.rateStart);
        this.rateEndRowText.checkContain(data.rateEnd);
        this.deltaRateRowText.checkContain(data.rate);
        this.deltaRatePercentRowText.checkContain(data.ratePercent);
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
        for (const value of pnlTableNameColumns) {
            cy.contains(selector, value);
        }
    }
}

export const pnlTableRow = new PNLTableRow();
