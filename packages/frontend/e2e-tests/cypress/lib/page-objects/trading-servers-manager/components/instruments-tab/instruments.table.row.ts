import { Text } from '../../../../base/elements/text';
import { ETableBodySelectors, TableRow } from '../../../common/table/table.row';

export enum ETableTabRowInstrumentsTabSelectors {
    PublisherRowText = `${ETableBodySelectors.TableBody} [col-id="publisher"]`,
    ValueRowText = `${ETableBodySelectors.TableBody} [col-id="value"]`,
}
export class InstrumentsTableRow extends TableRow {
    readonly publisherRowText = new Text(
        ETableTabRowInstrumentsTabSelectors.PublisherRowText,
        false,
    );
    readonly valueRowText = new Text(ETableTabRowInstrumentsTabSelectors.ValueRowText, false);
}

export const instrumentsTableRow = new InstrumentsTableRow();
