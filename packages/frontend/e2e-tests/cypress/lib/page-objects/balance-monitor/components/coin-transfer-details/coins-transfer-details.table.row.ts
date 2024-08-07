import { getDataCoinTransferDetails } from '../../../../../support/data/balance-monitor/getDataCoinTransferDetails';
import { Text } from '../../../../base/elements/text';
import { ETableBodySelectors, TableRow } from '../../../common/table/table.row';

export enum ECoinsTransferDetailsTableSelectors {
    SourceRowText = `${ETableBodySelectors.TableBody} [col-id="source"]`,
    DestinationRowText = `${ETableBodySelectors.TableBody} [col-id="destination"]`,
    NetworkRowText = `${ETableBodySelectors.TableBody} [col-id="network"]`,
    ExchangeMinRowText = `${ETableBodySelectors.TableBody} [col-id="exchangeMin"]`,
    ExchangeMaxRowText = `${ETableBodySelectors.TableBody} [col-id="exchangeMax"]`,
    AccountMinRowText = `${ETableBodySelectors.TableBody} [col-id="accountMin"]`,
    AccountMaxRowText = `${ETableBodySelectors.TableBody} [col-id="accountMax"]`,
}
export class CoinsTransferDetailsTableRow extends TableRow {
    readonly sourceRowText = new Text(ECoinsTransferDetailsTableSelectors.SourceRowText, false);
    readonly networkRowText = new Text(ECoinsTransferDetailsTableSelectors.NetworkRowText, false);
    readonly destinationRowText = new Text(
        ECoinsTransferDetailsTableSelectors.DestinationRowText,
        false,
    );
    readonly exchangeMinRowText = new Text(
        ECoinsTransferDetailsTableSelectors.ExchangeMinRowText,
        false,
    );
    readonly exchangeMaxRowText = new Text(
        ECoinsTransferDetailsTableSelectors.ExchangeMaxRowText,
        false,
    );
    readonly accountMinRowText = new Text(
        ECoinsTransferDetailsTableSelectors.AccountMinRowText,
        false,
    );
    readonly accountMaxRowText = new Text(
        ECoinsTransferDetailsTableSelectors.AccountMaxRowText,
        false,
    );

    checkDataTable() {
        const data = getDataCoinTransferDetails();
        this.coinRowText.checkContain(data.coin);
        this.sourceRowText.checkContain(data.source);
        this.destinationRowText.checkContain(data.destination);
        this.networkRowText.checkContain(data.network);
        this.exchangeMinRowText.checkContain(data.exchangeMin);
        this.exchangeMaxRowText.checkContain(data.exchangeMax);
        this.accountMinRowText.checkContain(data.accountMin);
        this.accountMaxRowText.checkContain(data.accountMax);
    }

    checkContainNetwork(network: string) {
        this.checkContainTextInColumn(ECoinsTransferDetailsTableSelectors.NetworkRowText, network);
    }
}

export const coinsTransferDetailsTableRow = new CoinsTransferDetailsTableRow();
