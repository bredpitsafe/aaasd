import { getDataTradesTable } from '../../../../support/data/trading-stats/daily/tradesDailyTable';
import { Text } from '../../../base/elements/text';
import { customWait } from '../../../web-socket/server';
import { ETableBodySelectors, TableRow } from '../../common/table/table.row';

export enum ETradesTableRowSelectors {
    StrategyRowText = `${ETableBodySelectors.TableBody} [col-id="strategy"]`,
    RobotNameRowText = `${ETableBodySelectors.TableBody} [col-id="robotName"]`,
    ExchangeNameRowText = `${ETableBodySelectors.TableBody} [col-id="exchangeName"]`,
    GateNameRowText = `${ETableBodySelectors.TableBody} [col-id="gateName"]`,
    VirtualAccountNameRowText = `${ETableBodySelectors.TableBody} [col-id="virtualAccountName"]`,
    AccountNameText = `${ETableBodySelectors.TableBody} [col-id="accountName"]`,
    InstrumentNameRowText = `${ETableBodySelectors.TableBody} [col-id="instrumentName"]`,
    SideRowText = `${ETableBodySelectors.TableBody} [col-id="side"]`,
    BaseAmountRowText = `${ETableBodySelectors.TableBody} [col-id="baseAmount"]`,
    BaseAssetNameRowText = `${ETableBodySelectors.TableBody} [col-id="baseAssetName"]`,
    QuoteAmountRowText = `${ETableBodySelectors.TableBody} [col-id="quoteAmount"]`,
    QuoteAssetNameRowText = `${ETableBodySelectors.TableBody} [col-id="quoteAssetName"]`,
    FeeAssetNameRowText = `${ETableBodySelectors.TableBody} [col-id="feeAssetName"]`,
    OrderTagRowText = `${ETableBodySelectors.TableBody} [col-id="orderTag"]`,
}

export class TradesTableRow extends TableRow {
    readonly strategyRowText = new Text(ETradesTableRowSelectors.StrategyRowText, false);
    readonly robotNameRowText = new Text(ETradesTableRowSelectors.RobotNameRowText, false);
    readonly exchangeNameRowText = new Text(ETradesTableRowSelectors.ExchangeNameRowText, false);
    readonly gateNameRowText = new Text(ETradesTableRowSelectors.GateNameRowText, false);
    readonly virtualAccountNameRowText = new Text(
        ETradesTableRowSelectors.VirtualAccountNameRowText,
        false,
    );
    readonly accountNameText = new Text(ETradesTableRowSelectors.AccountNameText, false);
    readonly instrumentNameRowText = new Text(
        ETradesTableRowSelectors.InstrumentNameRowText,
        false,
    );
    readonly sideRowText = new Text(ETradesTableRowSelectors.SideRowText, false);
    readonly baseAmountRowText = new Text(ETradesTableRowSelectors.BaseAmountRowText, false);
    readonly baseAssetNameRowText = new Text(ETradesTableRowSelectors.BaseAssetNameRowText, false);
    readonly quoteAmountRowText = new Text(ETradesTableRowSelectors.QuoteAmountRowText, false);
    readonly quoteAssetNameRowText = new Text(
        ETradesTableRowSelectors.QuoteAssetNameRowText,
        false,
    );
    readonly feeAssetNameRowText = new Text(ETradesTableRowSelectors.FeeAssetNameRowText, false);
    readonly orderTagRowText = new Text(ETradesTableRowSelectors.OrderTagRowText, false);

    checkDataInTradesTable(): void {
        const data = getDataTradesTable();
        customWait(5);
        this.platformTimeRowText.scrollAndCheckContains(data.platformTime);
        this.exchangeTimeRowText.scrollAndCheckContains(data.exchangeTime);
        this.strategyRowText.scrollAndCheckContains(data.strategy);
        this.robotNameRowText.scrollAndCheckContains(data.robot);
        this.exchangeNameRowText.scrollAndCheckContains(data.exch);
        this.gateNameRowText.scrollAndCheckContains(data.gate);
        this.virtualAccountNameRowText.scrollAndCheckContains(data.virtAcc);
        this.accountNameText.scrollAndCheckContains(data.account);
        this.instrumentNameRowText.scrollAndCheckContains(data.instr);
        this.roleRowText.scrollAndCheckContains(data.role);
        this.sideRowText.scrollAndCheckContains(data.side);
        this.baseAmountRowText.scrollAndCheckContains(data.baseAmt);
        this.baseAssetNameRowText.scrollAndCheckContains(data.baseAsset);
        this.quoteAmountRowText.scrollAndCheckContains(data.quoteAmt);
        this.quoteAssetNameRowText.scrollAndCheckContains(data.quoteAsset);
        this.feeAmountRowText.scrollAndCheckContains(data.feeAmt);
        this.feeAssetNameRowText.scrollAndCheckContains(data.feeAsset);
        this.orderTagRowText.scrollAndCheckContains(data.orderTag);
    }

    checkContainStrategy(nameStrategies: string[]): void {
        nameStrategies.forEach((nameStrategy) => this.strategyRowText.contains(nameStrategy));
    }

    checkContainBaseAsset(nameStrategies: string[]): void {
        nameStrategies.forEach((nameStrategy) => this.baseAssetNameRowText.contains(nameStrategy));
    }

    checkContainQuoteAsset(nameStrategies: string[]): void {
        nameStrategies.forEach((nameStrategy) => this.quoteAssetNameRowText.contains(nameStrategy));
    }

    checkContainExchanges(nameStrategies: string[]): void {
        nameStrategies.forEach((nameStrategy) => this.exchangeNameRowText.contains(nameStrategy));
    }

    checkContainInstruments(nameStrategies: string[]): void {
        nameStrategies.forEach((nameStrategy) => this.instrumentNameRowText.contains(nameStrategy));
    }

    checkNotContainStrategy(nameStrategies: string[]): void {
        nameStrategies.forEach((nameStrategy) =>
            this.strategyRowText.checkNotContain(nameStrategy),
        );
    }

    checkNotContainBaseAsset(nameStrategies: string[]): void {
        nameStrategies.forEach((nameStrategy) =>
            this.baseAssetNameRowText.checkNotContain(nameStrategy),
        );
    }

    checkNotContainQuoteAsset(nameStrategies: string[]): void {
        nameStrategies.forEach((nameStrategy) =>
            this.quoteAssetNameRowText.checkNotContain(nameStrategy),
        );
    }

    checkNotContainExchanges(nameStrategies: string[]): void {
        nameStrategies.forEach((nameStrategy) =>
            this.exchangeNameRowText.checkNotContain(nameStrategy),
        );
    }

    checkNotContainInstruments(nameStrategies: string[]): void {
        nameStrategies.forEach((nameStrategy) =>
            this.instrumentNameRowText.checkNotContain(nameStrategy),
        );
    }
}

export const tradesTableRow = new TradesTableRow();
