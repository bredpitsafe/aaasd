import { testSelector } from '@frontend/common/e2e';
import { EIndicatorsTabSelectors } from '@frontend/common/e2e/selectors/trading-servers-manager/components/indicators-tab/indicators.tab.selectors';

import { Text } from '../../../../base/elements/text';
import { customWait } from '../../../../web-socket/server';
import { ETableBodySelectors, TableRow } from '../../../common/table/table.row';
import { ETableRowSelectors } from '../../../common/table/table.row-selectors';

export enum ETableTabRowIndicatorsSelectors {
    PublisherRowText = `${ETableBodySelectors.TableBody} [col-id="publisher"]`,
    ValueRowText = `${ETableBodySelectors.TableBody} [col-id="value"]`,
}

export class IndicatorsTableRow extends TableRow {
    readonly publisherRowText = new Text(ETableTabRowIndicatorsSelectors.PublisherRowText, false);
    readonly valueRowText = new Text(ETableTabRowIndicatorsSelectors.ValueRowText, false);

    checkDownloadRow(name: string) {
        customWait(1);
        switch (name) {
            case 'CSV':
                this.checkDownloadCSVRow('indicators/indicators-csv.txt');
                break;
            case 'TSV':
                this.checkDownloadTSVRow('indicators/indicators-tsv.txt');
                break;
            case 'JSON':
                this.checkDownloadJSONRow('indicators/indicators.json');
                break;
            case 'Two Rows JSON':
                this.checkDownloadJSONRow('indicators/indicators-two-rows.json');
                break;
            case 'Six Rows JSON':
                this.checkDownloadJSONRow('indicators/indicators-six-rows.json');
                break;
            case 'All Rows':
                this.checkDownloadTXTRow('indicators/indicators-six-rows.txt');
                break;
            case 'Two Rows':
                this.checkDownloadTXTRow('indicators/indicators-two-rows.txt');
                break;
            case 'Row':
                this.checkDownloadTXTRow('indicators/indicators-row.txt');
                break;
            case 'Cell':
                this.checkDownloadTXTRow('indicators/indicators-cell.txt');
                break;
        }
        customWait(1);
    }

    checkDownloadText(expectedText) {
        customWait(2);
        cy.window().then((win) => {
            win.navigator.clipboard.readText().then((text) => {
                expect(text).to.eq(expectedText);
            });
        });
        customWait(1);
    }

    getUpdateTime(alias) {
        cy.get(ETableRowSelectors.UpdateTimeRowText)
            .first()
            .invoke('text')
            .then((name) => {
                cy.wrap(name).as(alias);
            });
    }

    getActualUpdateTime() {
        this.getUpdateTime('updateTime');
    }

    getNewActualUpdateTime() {
        this.getUpdateTime('updateNewTime');
    }

    checkNotFirstName(): void {
        cy.get('@lastName').then((object) => {
            const oldName = object as unknown as string;
            cy.log(oldName);

            cy.get(testSelector(EIndicatorsTabSelectors.IndicatorsTab)).within(() => {
                cy.get(ETableRowSelectors.NameRowText)
                    .first()
                    .invoke('text')
                    .then((newName) => {
                        expect(newName !== oldName).to.be.equal(true);
                    });
            });
        });
    }

    getActualFirstRow(): void {
        let lastRow;
        cy.get(testSelector(EIndicatorsTabSelectors.IndicatorsTab)).within(() => {
            cy.get(ETableRowSelectors.NameRowText).first().invoke('text').as('lastName');
            cy.get(ETableRowSelectors.ValueRowText).first().invoke('text').as('lastValue');
            cy.get(ETableRowSelectors.UpdateTimeRowText)
                .first()
                .invoke('text')
                .as('lastUpdateTime');
        });
        cy.get('@lastName').then((lastName) => {
            cy.get('@lastValue').then((lastValue) => {
                cy.get('@lastUpdateTime').then((lastUpdateTime) => {
                    lastRow = lastName + ' ' + lastValue + ' ' + lastUpdateTime;
                    cy.wrap(lastName).as('lastName');
                    cy.wrap(lastRow).as('lastRow');
                });
            });
        });
    }

    checkNotFirstRow(): void {
        cy.get('@lastRow').then((object) => {
            cy.get('@lastName').then((object) => {
                const oldName = object as unknown as string;
                cy.wrap(oldName).as('oldName');
            });
            const oldRow = object as unknown as string;
            this.getActualFirstRow();
            cy.get('@lastRow').then((object) => {
                const newRow = object as unknown as string;
                expect(newRow !== oldRow).to.be.equal(true);
            });
        });
    }
}

export const indicatorsTableRow = new IndicatorsTableRow();
