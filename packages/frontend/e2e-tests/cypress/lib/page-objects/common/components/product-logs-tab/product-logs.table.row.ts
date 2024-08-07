import { testSelector } from '@frontend/common/e2e';
import { EProductLogsTabSelectors } from '@frontend/common/e2e/selectors/backtesting/components/product-logs-tab/product-logs.tab.selectors';

import { Text } from '../../../../base/elements/text';
import { TDataTask } from '../../../../interfaces/backtesting/dataTack';
import { ETableBodySelectors, TableRow } from '../../table/table.row';

export enum EProductLogsTableRowSelectors {
    TimeRowText = `${ETableBodySelectors.TableBody} [col-id="platformTime"]`,
    LevelRowText = `${ETableBodySelectors.TableBody} [col-id="level"]`,
    MessageRowText = `${ETableBodySelectors.TableBody} [col-id="message"]`,
    ActorKeyText = `${ETableBodySelectors.TableBody} [col-id="actorKey"]`,
    ActorGroupText = `${ETableBodySelectors.TableBody} [col-id="actorGroup"]`,
}
export class ProductLogsTableRow extends TableRow {
    readonly timeRowText = new Text(EProductLogsTableRowSelectors.TimeRowText, false);
    readonly levelRowText = new Text(EProductLogsTableRowSelectors.LevelRowText, false);
    readonly messageRowText = new Text(EProductLogsTableRowSelectors.MessageRowText, false);
    readonly actorKeyText = new Text(EProductLogsTableRowSelectors.ActorKeyText, false);
    readonly actorGroupText = new Text(EProductLogsTableRowSelectors.ActorGroupText, false);

    checkAllRowsLevelContainText(text: string): void {
        this.tableBody.checkAllRowsWithLocatorContainText(
            EProductLogsTableRowSelectors.LevelRowText,
            text,
        );
    }

    checkAllRowsMessageContainText(text: string): void {
        this.tableBody.checkAllRowsWithLocatorContainTextCaseInsensitive(
            EProductLogsTableRowSelectors.MessageRowText,
            text,
        );
    }

    checkAllRowsActorKeyContainText(text: string): void {
        this.tableBody.checkAllRowsWithLocatorContainText(
            EProductLogsTableRowSelectors.ActorKeyText,
            text,
        );
    }

    checkAllRowsActorGroupContainText(text: string): void {
        this.tableBody.checkAllRowsWithLocatorContainText(
            EProductLogsTableRowSelectors.ActorGroupText,
            text,
        );
    }

    checkAllRowsMessageNotContainText(text: string): void {
        this.tableBody.checkAllRowsWithLocatorNotContainText(
            EProductLogsTableRowSelectors.MessageRowText,
            text,
        );
    }

    checkAllRowsActorKeyNotContainText(text: string): void {
        this.tableBody.checkAllRowsWithLocatorNotContainText(
            EProductLogsTableRowSelectors.ActorKeyText,
            text,
        );
    }

    checkAllRowsActorGroupNotContainText(text: string): void {
        this.tableBody.checkAllRowsWithLocatorNotContainText(
            EProductLogsTableRowSelectors.ActorGroupText,
            text,
        );
    }

    checkDataCreatedTask(data: TDataTask) {
        this.timeRowText.checkContain(data.simStartTimes[0]);
        this.levelRowText.checkContain(data.level);
        this.componentRowText.checkContain(data.component);
        this.messageRowText.checkContain(data.startMessage);
        this.messageRowText.checkContain(data.endMessage);
    }

    checkDateRunByIndex(data: TDataTask, index: number) {
        cy.get(testSelector(EProductLogsTabSelectors.ProductLogsTab)).within(() =>
            this.timeRowText.checkContain(data.timeUTCs[index]),
        );
    }

    checkDataSucceedTask() {
        this.messageRowText.checkContain('started');
    }

    checkDataFailedTask() {
        this.levelRowText.checkContain('Error');
    }

    getActualLastMessage(): void {
        cy.get(EProductLogsTableRowSelectors.MessageRowText)
            .first()
            .invoke('text')
            .then((date) => {
                cy.wrap(date).as('lastMessage');
            });
    }

    getActualLastTime(): void {
        cy.get(EProductLogsTableRowSelectors.TimeRowText)
            .first()
            .invoke('text')
            .then((date) => {
                cy.wrap(date).as('lastTime');
            });
    }

    checkNotLastMessage(): void {
        cy.get('@lastMessage').then((object) => {
            const oldDate = object as unknown as string;
            cy.get(EProductLogsTableRowSelectors.MessageRowText)
                .first()
                .invoke('text')
                .then((newDate) => {
                    expect(newDate).to.not.equal(oldDate);
                });
        });
    }

    checkNotLastTime(): void {
        cy.get('@lastTime').then((object) => {
            const oldDate = object as unknown as string;
            cy.get(EProductLogsTableRowSelectors.TimeRowText)
                .first()
                .invoke('text')
                .then((newDate) => {
                    expect(newDate > oldDate).to.be.equal(true);
                });
        });
    }

    checkNotDuplicateRecords(): void {
        const firstMessageText = this.messageRowText.get().eq(0).invoke('text');
        const secondMessageText = this.messageRowText.get().eq(1).invoke('text');
        expect(firstMessageText).not.to.equal(secondMessageText);
    }

    scrollToFirstElementMultipleTimes(maxScrollAttempts: number): void {
        for (let scrollAttempts = 0; scrollAttempts < maxScrollAttempts; scrollAttempts++) {
            this.tableBody.get().last().scrollTo('top');
            cy.wait(1000);
        }
    }

    scrollToLastElementMultipleTimes(maxScrollAttempts: number): void {
        for (let scrollAttempts = 0; scrollAttempts < maxScrollAttempts; scrollAttempts++) {
            this.tableBody.get().last().scrollTo('bottom');
            cy.wait(1000);
        }
    }

    checkVisibleCreatUser() {
        cy.get('@userName').then((object) => {
            const userName = object as unknown as string;
            this.messageRowText.contains(userName);
        });
    }
}

export const productLogsTableRow = new ProductLogsTableRow();
