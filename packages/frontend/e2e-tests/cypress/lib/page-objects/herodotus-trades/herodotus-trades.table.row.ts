import { Text } from '../../base/elements/text';
import { THerodotusTradesData } from '../../interfaces/herodotus-trades/herodotusTradesData';
import { ETableBodySelectors, TableRow } from '../common/table/table.row';
export enum EHerodotusTradesTableRowSelectors {
    InstrumentRowText = `${ETableBodySelectors.TableBody} [col-id="instrument"]`,
    BaseRowText = `${ETableBodySelectors.TableBody} [col-id="baseAsset"]`,
    QuoteRowText = `${ETableBodySelectors.TableBody} [col-id="quoteAsset"]`,
    TypeRowText = `${ETableBodySelectors.TableBody} [col-id="type"]`,
    SizeRowText = `${ETableBodySelectors.TableBody} [col-id="baseAmount"]`,
    VolumeRowText = `${ETableBodySelectors.TableBody} [col-id="quoteAmount"]`,
    FeeRowText = `${ETableBodySelectors.TableBody} [col-id="feeAsset"]`,
}

export class HerodotusTradesTableRow extends TableRow {
    readonly instrumentRowText = new Text(
        EHerodotusTradesTableRowSelectors.InstrumentRowText,
        false,
    );
    readonly baseRowText = new Text(EHerodotusTradesTableRowSelectors.BaseRowText, false);
    readonly quoteRowText = new Text(EHerodotusTradesTableRowSelectors.QuoteRowText, false);
    readonly typeRowText = new Text(EHerodotusTradesTableRowSelectors.TypeRowText, false);
    readonly sizeRowText = new Text(EHerodotusTradesTableRowSelectors.SizeRowText, false);
    readonly volumeRowText = new Text(EHerodotusTradesTableRowSelectors.VolumeRowText, false);
    readonly feeRowText = new Text(EHerodotusTradesTableRowSelectors.FeeRowText, false);

    checkDataInTable(data: THerodotusTradesData): void {
        this.platformTimeRowText.checkContain(data.platformTime);
        this.exchangeTimeRowText.checkContain(data.exchangeTime);
        this.instrumentRowText.checkContain(data.instrument);
        this.makerRowText.checkContain(data.market);
        this.baseRowText.checkContain(data.base);
        this.quoteRowText.checkContain(data.quote);
        this.typeRowText.checkContain(data.type);
        this.roleRowText.checkContain(data.role);
        this.priceRowText.checkContain(data.price);
        this.sizeRowText.checkContain(data.size);
        this.volumeRowText.checkContain(data.volume);
        this.feeRowText.checkContain(data.fee);
        this.feeAmountRowText.checkContain(data.feeAmount);
        this.idRowText.checkContain(data.id);
    }
}

export const herodotusTradesTableRow = new HerodotusTradesTableRow();
