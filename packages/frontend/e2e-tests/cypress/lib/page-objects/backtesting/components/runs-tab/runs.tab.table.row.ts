import { ERunsTabSelectors } from '@frontend/common/e2e/selectors/backtesting/components/runs-tab/runs.tab.selectors';

import { Text } from '../../../../base/elements/text';
import { TDataTask } from '../../../../interfaces/backtesting/dataTack';
import { EContextMenuSelectors } from '../../../common/context.menu';
import { ETableBodySelectors, TableRow } from '../../../common/table/table.row';

export enum ERunsTabTableRowSelectors {
    IdRunRowText = `${ETableBodySelectors.TableBody} [col-id*="btRunNo"]`,
    ScoreRowText = `${ETableBodySelectors.TableBody} [col-id*="score"]`,
    SpeedRowText = `${ETableBodySelectors.TableBody} [col-id*="speed"]`,
    ProgressRowText = `${ETableBodySelectors.TableBody} [col-id*="progress"]`,
    StartTimeRowText = `${ETableBodySelectors.TableBody} [col-id*="realStartTime"]`,
    ApproximateEndTimeRowText = `${ETableBodySelectors.TableBody} [col-id*="endTime"]`,
    SimCurrentTimeRowText = `${ETableBodySelectors.TableBody} [col-id*="simulationTime"]`,
    BuildRowText = `${ETableBodySelectors.TableBody} [col-id*="buildInfo"]`,
    SimStartTimeRowText = `${ETableBodySelectors.TableBody} [col-id*="simulationStartTime"]`,
    SimEndTimeRowText = `${ETableBodySelectors.TableBody} [col-id*="simulationEndTime"]`,
    StatusRunRowText = `${ETableBodySelectors.TableBody} [col-id*="status"]`,
}

export class RunsTabTableRow extends TableRow {
    readonly idRunRowText = new Text(ERunsTabTableRowSelectors.IdRunRowText, false);
    readonly scoreRowText = new Text(ERunsTabTableRowSelectors.ScoreRowText, false);
    readonly speedRowText = new Text(ERunsTabTableRowSelectors.SpeedRowText, false);
    readonly progressRowText = new Text(ERunsTabTableRowSelectors.ProgressRowText, false);
    readonly startTimeRowText = new Text(ERunsTabTableRowSelectors.StartTimeRowText, false);
    readonly approximateEndTimeRowText = new Text(
        ERunsTabTableRowSelectors.ApproximateEndTimeRowText,
        false,
    );
    readonly simCurrentTimeRowText = new Text(
        ERunsTabTableRowSelectors.SimCurrentTimeRowText,
        false,
    );
    readonly buildRowText = new Text(ERunsTabTableRowSelectors.BuildRowText, false);
    readonly simStartTimeRowText = new Text(ERunsTabTableRowSelectors.SimStartTimeRowText, false);
    readonly simEndTimeRowText = new Text(ERunsTabTableRowSelectors.SimEndTimeRowText, false);
    readonly statusTaskRowText = new Text(ERunsTabTableRowSelectors.StatusRunRowText, false);

    checkRunsData(data: TDataTask): void {
        cy.get(ERunsTabSelectors.RunsTab).within(() => {
            this.statusTaskRowText.checkContain(data.runStatus);
            this.progressRowText.checkContain(data.progress);
            data.simEndTimes.forEach((simEndTime) =>
                this.simCurrentTimeRowText.checkContain(simEndTime),
            );
            data.simStartTimes.forEach((simStartTime) =>
                this.simStartTimeRowText.checkContain(simStartTime),
            );
            data.simEndTimes.forEach((simEndTime) =>
                this.simEndTimeRowText.checkContain(simEndTime),
            );
        });
    }

    checkVisibleContextMenu(): void {
        cy.get(ERunsTabSelectors.RunsTab).within(() => {
            this.idRunRowText.get().last().rightclick();
        });
        cy.get(EContextMenuSelectors.ContextMenu).contains('Pause');
        cy.get(EContextMenuSelectors.ContextMenu).contains('Resume');
    }

    checkStatusRun(nameStatus: string, nameRun = 'first'): void {
        cy.get(ERunsTabSelectors.RunsTab).within(() => {
            switch (nameRun) {
                case 'first':
                    this.statusTaskRowText
                        .get()
                        .contains(nameStatus, { timeout: 120000 })
                        .should('be.visible');
                    break;
                case 'second':
                    this.statusTaskRowText
                        .get()
                        .contains(nameStatus, { timeout: 120000 })
                        .should('be.visible');
                    break;
                default:
                    throw new Error(`Invalid nameRun: ${nameRun}`);
            }
        });
    }

    getActualNameRun() {
        cy.get(ERunsTabTableRowSelectors.IdRunRowText)
            .first()
            .invoke('text')
            .then((name) => {
                cy.wrap(name).as('nameRun');
            });
    }
}

export const runsTabTableRow = new RunsTabTableRow();
