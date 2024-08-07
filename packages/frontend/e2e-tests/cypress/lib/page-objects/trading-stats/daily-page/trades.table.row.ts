import { getDataTradesTable } from '../../../../support/data/trading-stats/daily/tradesDailyTable';
import { Text } from '../../../base/elements/text';
import { customWait } from '../../../web-socket/server';
import { ETableHeaderSelectors } from '../../common/table/table.header';
import { ETableBodySelectors, TableRow } from '../../common/table/table.row';

const tradesTableNameColumns = [
    'Platform Time',
    'Exchange Time',
    'Strategy',
    'Robot',
    'Exch.',
    'Gate',
    'Virt. Acc',
    'Account',
    'Instr.',
    'Role',
    'Side',
    'Price',
];

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
    VolumeAmountRowText = `${ETableBodySelectors.TableBody} [col-id="volumeAmount"]`,
    VolumeAssetNameRowText = `${ETableBodySelectors.TableBody} [col-id="volumeAssetName"]`,
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
    readonly volumeAmountRowText = new Text(ETradesTableRowSelectors.VolumeAmountRowText, false);
    readonly volumeAssetNameRowText = new Text(
        ETradesTableRowSelectors.VolumeAssetNameRowText,
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
        this.volumeAmountRowText.scrollAndCheckContains(data.volumeAmt);
        this.volumeAssetNameRowText.scrollAndCheckContains(data.volumeAsset);
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
        nameStrategies.forEach((nameStrategy) =>
            this.volumeAssetNameRowText.contains(nameStrategy),
        );
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
            this.volumeAssetNameRowText.checkNotContain(nameStrategy),
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

    checkVisibleTable(): void {
        const selector = ETableHeaderSelectors.TableHeaderText;
        for (const value of tradesTableNameColumns) {
            cy.contains(selector, value);
        }
    }
}

export const tradesTableRow = new TradesTableRow();
