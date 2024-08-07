import { testSelector } from '@frontend/common/e2e';
import { EActiveTasksTabSelectors } from '@frontend/common/e2e/selectors/trading-servers-manager/components/active-tasks-tab/active-tasks.tab.selectors';
import { EArchivedTasksTabSelectors } from '@frontend/common/e2e/selectors/trading-servers-manager/components/archived-tasks-tab/aechived-tasks.tab.selectors';

import { Text } from '../../base/elements/text';
import { THerodotusTerminalTaskData } from '../../interfaces/herodotus-terminal/herodotusTerminalTaskData';
import { customWait } from '../../web-socket/server';
import { ETableBodySelectors, TableRow } from '../common/table/table.row';
import { ETableRowSelectors } from '../common/table/table.row-selectors';
export enum EHerodotusTerminalTableRowSelectors {
    TypeRowText = `${ETableBodySelectors.TableBody} [col-id="taskType"]`,
    AmountRowText = `${ETableBodySelectors.TableBody} [col-id="amountView"]`,
    AmountUSDRowText = `${ETableBodySelectors.TableBody} [col-id="amountUsd"]`,
    AssetRowText = `${ETableBodySelectors.TableBody} [col-id="asset"]`,
    ProgressRowText = `${ETableBodySelectors.TableBody} [col-id="progress"]`,
    AggressionRowText = `${ETableBodySelectors.TableBody} [col-id="aggression"]`,
    AggressionOverrideRowText = `${ETableBodySelectors.TableBody} [class*=ag-body-viewport] [col-id="aggressionOverride"]`,
    RealizedPremiumRowText = `${ETableBodySelectors.TableBody} [col-id="realizedPremium"]`,
    OrderSizeRowText = `${ETableBodySelectors.TableBody} [col-id="orderSize"]`,
    PriceLimitRowText = `${ETableBodySelectors.TableBody} [col-id="priceLimitView"]`,
    MaxPriceRowText = `${ETableBodySelectors.TableBody} [col-id="maxPremium"]`,
    TimestampRowText = `${ETableBodySelectors.TableBody} [col-id="lastChangedTs"]`,
    TimeStartedRowText = `${ETableBodySelectors.TableBody} [col-id="started"]`,
    FinishedRowText = `${ETableBodySelectors.TableBody} [col-id="finishedTs"]`,
    AveragePriceRowText = `${ETableBodySelectors.TableBody} [col-id="avgPriceView"]`,
    AverageRowText = `${ETableBodySelectors.TableBody} [col-id="avgPrice"]`,
    VolumeRowText = `${ETableBodySelectors.TableBody} [col-id="volume"]`,
    RoleRowText = `${ETableBodySelectors.TableBody} [class*=ag-body-viewport] [col-id="role"]`,
    FullNameRowText = `${ETableBodySelectors.TableBody} [col-id="fullName"]`,
    FilledAmountBaseRowText = `${ETableBodySelectors.TableBody} [col-id="filledAmountBase"]`,
    TargetPriceRowText = `${ETableBodySelectors.TableBody} [col-id="targetPrice"]`,
    OrderPriceRowText = `${ETableBodySelectors.TableBody} [col-id="orderPrice"]`,
    AveragePriceUsdRowText = `${ETableBodySelectors.TableBody} [col-id="avgPriceUsd"]`,
    StatusMessageRowText = `${ETableBodySelectors.TableBody} [col-id="statusMessage"]`,
}

export class HerodotusTerminalTableRow extends TableRow {
    readonly typeRowText = new Text(EHerodotusTerminalTableRowSelectors.TypeRowText, false);
    readonly amountRowText = new Text(EHerodotusTerminalTableRowSelectors.AmountRowText, false);
    readonly amountUSDRowText = new Text(
        EHerodotusTerminalTableRowSelectors.AmountUSDRowText,
        false,
    );
    readonly assetRowText = new Text(EHerodotusTerminalTableRowSelectors.AssetRowText, false);
    readonly progressRowText = new Text(EHerodotusTerminalTableRowSelectors.ProgressRowText, false);
    readonly averageRowText = new Text(EHerodotusTerminalTableRowSelectors.AverageRowText, false);
    readonly aggressionOverrideRowText = new Text(
        EHerodotusTerminalTableRowSelectors.AggressionOverrideRowText,
        false,
    );

    readonly aggressionRowText = new Text(
        EHerodotusTerminalTableRowSelectors.AggressionRowText,
        false,
    );
    readonly realizedPremiumRowText = new Text(
        EHerodotusTerminalTableRowSelectors.RealizedPremiumRowText,
        false,
    );
    readonly orderSizeRowText = new Text(
        EHerodotusTerminalTableRowSelectors.OrderSizeRowText,
        false,
    );
    readonly priceLimitRowText = new Text(
        EHerodotusTerminalTableRowSelectors.PriceLimitRowText,
        false,
    );
    readonly maxPriceRowText = new Text(EHerodotusTerminalTableRowSelectors.MaxPriceRowText, false);
    readonly timestampRowText = new Text(
        EHerodotusTerminalTableRowSelectors.TimestampRowText,
        false,
    );
    readonly timeStartedRowText = new Text(
        EHerodotusTerminalTableRowSelectors.TimeStartedRowText,
        false,
    );
    readonly finishedRowText = new Text(EHerodotusTerminalTableRowSelectors.FinishedRowText, false);
    readonly averagePriceRowText = new Text(
        EHerodotusTerminalTableRowSelectors.AveragePriceRowText,
        false,
    );
    readonly volumeRowText = new Text(EHerodotusTerminalTableRowSelectors.VolumeRowText, false);
    readonly roleRowText = new Text(EHerodotusTerminalTableRowSelectors.RoleRowText, false);
    readonly fullNameRowText = new Text(EHerodotusTerminalTableRowSelectors.FullNameRowText, false);
    readonly filledAmountBaseRowText = new Text(
        EHerodotusTerminalTableRowSelectors.FilledAmountBaseRowText,
        false,
    );
    readonly targetPriceRowText = new Text(
        EHerodotusTerminalTableRowSelectors.TargetPriceRowText,
        false,
    );
    readonly orderPriceRowText = new Text(
        EHerodotusTerminalTableRowSelectors.OrderPriceRowText,
        false,
    );
    readonly averagePriceUsdRowText = new Text(
        EHerodotusTerminalTableRowSelectors.AveragePriceUsdRowText,
        false,
    );
    readonly statusMessageRowText = new Text(
        EHerodotusTerminalTableRowSelectors.StatusMessageRowText,
        false,
    );

    getTaskID() {
        cy.get(testSelector(EActiveTasksTabSelectors.ActiveTasksTable)).within(() => {
            cy.get(ETableRowSelectors.TaskIDRowText)
                .first()
                .invoke('text')
                .then((name) => {
                    cy.wrap(name).as('taskID');
                });
        });
    }

    selectTaskByIDByNameTab(numberTask: string, nameTab: string): void {
        const tabSelector = this.tabSelector(nameTab);
        cy.get(testSelector(tabSelector)).within(() => {
            this.taskIDRowText.containsClick(numberTask);
        });
    }

    rightClickByTaskIDByNameTab(numberTask: string, nameTab: string): void {
        const tabSelector = this.tabSelector(nameTab);
        cy.get(testSelector(tabSelector)).within(() => {
            this.taskIDRowText.get().contains(numberTask).rightclick();
        });
    }

    rightClickNewTaskNameTab(nameTab: string): void {
        const tabSelector = this.tabSelector(nameTab);
        cy.get(testSelector(tabSelector)).within(() => {
            this.taskIDRowText.get().first().rightclick();
        });
    }

    clickFirstArrowButton(nameTab: string): void {
        const tabSelector = this.tabSelector(nameTab);
        cy.get(testSelector(tabSelector)).within(() => {
            this.arrowButton.clickFirst();
        });
    }

    checkAllRowsIsContainStatusInTab(nameTab: string, typeStatus: string): void {
        const tabSelector = this.tabSelector(nameTab);
        cy.get(testSelector(tabSelector)).within(() => {
            this.checkAllRowsIsContainStatus(typeStatus, true);
        });
    }

    checkRowContainType(nameTab: string, type: string): void {
        const tabSelector = this.tabSelector(nameTab);
        cy.get(testSelector(tabSelector)).within(() => {
            this.checkAllRowsContainType(type);
        });
    }

    clickLastArrowButton(nameTab: string): void {
        const tabSelector = this.tabSelector(nameTab);
        cy.get(testSelector(tabSelector)).within(() => {
            this.arrowButton.clickLast();
        });
    }

    private checkDownloadRow(name: string, prefix: string) {
        customWait(1);
        switch (name) {
            case 'CSV':
                this.checkDownloadCSVRow(`herodotus-terminal/${prefix}-task-csv.txt`);
                break;
            case 'TSV':
                this.checkDownloadTSVRow(`herodotus-terminal/${prefix}-task-tsv.txt`);
                break;
            case 'JSON':
                this.checkDownloadJSONRow(`herodotus-terminal/${prefix}-task.json`);
                break;
        }
        customWait(1);
    }

    checkDownloadActiveRow(name: string) {
        this.checkDownloadRow(name, 'active');
    }

    checkDownloadArchivedRow(name: string) {
        this.checkDownloadRow(name, 'archived');
    }

    checkDownloadTSVRow(failName: string) {
        cy.fixture(failName).then((tsv) => {
            const expectedText = tsv + '\t\t\t\t\t\t\t\t';
            cy.window().then((win) => {
                win.navigator.clipboard.readText().then((text) => {
                    expect(text).to.equal(expectedText);
                });
            });
        });
    }

    checkDataTaskByNameTab(taskData: THerodotusTerminalTaskData, nameTab: string): void {
        switch (nameTab) {
            case 'Active Tasks':
                cy.get(testSelector(EActiveTasksTabSelectors.ActiveTasksTable)).within(() => {
                    this.checkDataTaskByDataTask(taskData);
                    this.taskIDRowText.contains(taskData.idTask);
                    this.statusTaskRowText.contains(taskData.statusTask);
                    this.orderSizeRowText.contains(taskData.orderSizeTask);
                    this.timestampRowText.contains(taskData.updatedTask);
                });
                break;
            case 'Archived Tasks':
                cy.get(testSelector(EArchivedTasksTabSelectors.ArchivedTasksTable)).within(() => {
                    this.checkDataTaskByDataTask(taskData);
                    this.taskIDRowText.contains(taskData.idTask);
                    this.finishedRowText.contains(taskData.realizedPremiumTask);
                });
                break;
        }
    }

    checkAddedDataTaskByNameTab(taskData: THerodotusTerminalTaskData, nameTab: string) {
        switch (nameTab) {
            case 'Active Tasks':
                cy.get(testSelector(EActiveTasksTabSelectors.ActiveTasksTable)).within(() => {
                    this.checkAddedDataTask(taskData);
                    this.targetPriceRowText.contains(taskData.target);
                });
                break;
            case 'Archived Tasks':
                cy.get(testSelector(EArchivedTasksTabSelectors.ArchivedTasksTable)).within(() => {
                    this.checkAddedDataTask(taskData);
                });
                break;
        }
    }

    checkDataTask(taskData: THerodotusTerminalTaskData): void {
        cy.get(testSelector(EActiveTasksTabSelectors.ActiveTasksTable)).within(() => {
            this.checkDataTaskByDataTask(taskData);
            this.checkAddedDataTask(taskData);
            this.orderSizeRowText.contains(taskData.orderSizeTask);
        });
    }

    private tabSelector(nameTab: string): string {
        return nameTab === 'Active Tasks'
            ? EActiveTasksTabSelectors.ActiveTasksTable
            : EArchivedTasksTabSelectors.ArchivedTasksTable;
    }

    private checkDataTaskByDataTask(taskData: THerodotusTerminalTaskData): void {
        // this.progressRowText.contains(taskData.progressTask);
        this.typeRowText.contains(taskData.typeTask);
        // this.amountRowText.contains(taskData.amntTask);
        this.assetRowText.contains(taskData.assetTask);
        this.realizedPremiumRowText.contains(taskData.realizedPremiumTask);
        this.priceLimitRowText.contains(taskData.priceLimitTask);
        this.aggressionRowText.contains(taskData.aggrTask);
        this.averagePriceRowText.contains(taskData.avgPriceTask);
        this.volumeRowText.contains(taskData.volumeTask);
    }

    private checkAddedDataTask(taskData: THerodotusTerminalTaskData): void {
        this.typeRowText.get().last().contains(taskData.side);
        this.roleRowText.get().last().contains(taskData.role);
        this.filledAmountBaseRowText.get().last().contains(taskData.amount);
        this.orderPriceRowText.get().last().contains(taskData.order);
        this.averageRowText.get().last().contains(taskData.average);
        this.averagePriceUsdRowText.get().last().contains(taskData.avgPrice);
        this.volumeRowText.get().last().contains(taskData.volume);
    }
}

export const herodotusTerminalTableRow = new HerodotusTerminalTableRow();
