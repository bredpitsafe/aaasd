import { testSelector } from '@frontend/common/e2e';
import { EPumpAndDumpTabSelectors } from '@frontend/common/e2e/selectors/balance-monitor/components/pump-and-dump/pump-and-dump.tab.selectors';

import { Text } from '../../../../base/elements/text';
import { ETableBodySelectors, TableRow } from '../../../common/table/table.row';

export enum EPumpAndDumpTableSelectors {
    StartRateRowText = `${ETableBodySelectors.TableBody} [col-id="startRate.rate"]`,
    TimeIntervalRowText = `${ETableBodySelectors.TableBody} [col-id="timeInterval"]`,
    RateChangeRowText = `${ETableBodySelectors.TableBody} [col-id="rateChange"]`,
}
export class PumpAndDampTableRow extends TableRow {
    readonly timeIntervalRowText = new Text(EPumpAndDumpTableSelectors.TimeIntervalRowText, false);
    readonly rateChangeRowText = new Text(EPumpAndDumpTableSelectors.RateChangeRowText, false);

    checkDataTable() {
        cy.get(testSelector(EPumpAndDumpTabSelectors.PumpAndDumpTab)).within(() => {
            this.coinRowText.get().should('contain', 'AAA');
            this.timeIntervalRowText.get().should('contain', '1m');
        });
    }

    checkContainTimeInterval(value: string) {
        this.checkContainTextInColumn(EPumpAndDumpTableSelectors.TimeIntervalRowText, value);
    }
}

export const pumpAndDampTableRow = new PumpAndDampTableRow();
