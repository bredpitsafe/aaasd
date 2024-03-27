import { getDataPNLTable } from '../../../../support/data/trading-stats/daily/pnlDailyTable';
import { Text } from '../../../base/elements/text';
import { ETableBodySelectors, TableRow } from '../../common/table/table.row';
import { tradingStatsPage } from '../trading-stats.page';

export enum EPNLTableRowSelectors {
    StrategyRowText = `${ETableBodySelectors.TableBody} [col-id="ag-Grid-AutoColumn-strategy"]`,
    BalanceStartRowText = `${ETableBodySelectors.TableBody} [col-id="balanceStart"]`,
    BalanceEndRowText = `${ETableBodySelectors.TableBody} [col-id="balanceEnd"]`,
    DeltaBalanceRowText = `${ETableBodySelectors.TableBody} [col-id="deltaBalance"]`,
    DeltaBalanceUsdRowText = `${ETableBodySelectors.TableBody} [col-id="deltaBalanceUsd"]`,
    DeltaUSDRowText = `${ETableBodySelectors.TableBody} [col-id="deltaUsd"]`,
    PriceStartRowText = `${ETableBodySelectors.TableBody} [col-id="priceStart"]`,
    PriceEndRowText = `${ETableBodySelectors.TableBody} [col-id="priceEnd"]`,
    DeltaPriceRowText = `${ETableBodySelectors.TableBody} [col-id="deltaPrice"]`,
    DeltaPricePercentRowText = `${ETableBodySelectors.TableBody} [col-id="deltaPricePercent"]`,
}

export class PNLTableRow extends TableRow {
    readonly strategyRowText = new Text(EPNLTableRowSelectors.StrategyRowText, false);
    readonly balanceStartRowText = new Text(EPNLTableRowSelectors.BalanceStartRowText, false);
    readonly balanceEndRowText = new Text(EPNLTableRowSelectors.BalanceEndRowText, false);
    readonly deltaBalanceRowText = new Text(EPNLTableRowSelectors.DeltaBalanceRowText, false);
    readonly deltaBalanceUsdRowText = new Text(EPNLTableRowSelectors.DeltaBalanceUsdRowText, false);
    readonly deltaUSDRowText = new Text(EPNLTableRowSelectors.DeltaUSDRowText, false);
    readonly priceStartRowText = new Text(EPNLTableRowSelectors.PriceStartRowText, false);
    readonly priceEndRowText = new Text(EPNLTableRowSelectors.PriceEndRowText, false);
    readonly deltaPriceRowText = new Text(EPNLTableRowSelectors.DeltaPriceRowText, false);
    readonly deltaPricePercentRowText = new Text(
        EPNLTableRowSelectors.DeltaPricePercentRowText,
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
        this.priceStartRowText.checkContain(data.priceStart);
        this.priceEndRowText.checkContain(data.priceEnd);
        this.deltaPriceRowText.checkContain(data.price);
        this.deltaPricePercentRowText.checkContain(data.pricePercent);
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

export const pnlTableRow = new PNLTableRow();
