import { EProductLogsTabSelectors } from '@frontend/common/e2e/selectors/trading-servers-manager/components/product-logs-tab/product-logs.tab.selectors';

import { Button } from '../../../../base/elements/button';
import { Input } from '../../../../base/elements/input';
import { Select } from '../../../../base/elements/select';
import { TDataTask } from '../../../../interfaces/backtesting/dataTack';
import { customWait } from '../../../../web-socket/server';
import { ETableContextMenuSelectors, TableContextMenu } from '../../table/table.context-menu';

class ProductLogsTab extends TableContextMenu {
    readonly serverFilterButton = new Button(EProductLogsTabSelectors.ServerFilterButton);
    readonly sinceButton = new Input(EProductLogsTabSelectors.SinceButton);
    readonly tillButton = new Input(EProductLogsTabSelectors.TillButton);
    readonly levelSelector = new Select(EProductLogsTabSelectors.LevelSelector);
    readonly includeMessageInput = new Select(EProductLogsTabSelectors.IncludeMessageInput);
    readonly includeActorKeyInput = new Select(EProductLogsTabSelectors.IncludeActorKeyInput);
    readonly includeActorGroupInput = new Select(EProductLogsTabSelectors.IncludeActorGroupInput);
    readonly excludeMessageInput = new Select(EProductLogsTabSelectors.ExcludeMessageInput);
    readonly excludeActorKeyInput = new Select(EProductLogsTabSelectors.ExcludeActorKeyInput);
    readonly excludeActorGroupInput = new Select(EProductLogsTabSelectors.ExcludeActorGroupInput);
    readonly applyButton = new Button(EProductLogsTabSelectors.ApplyButton);

    checkElementsExists(): void {
        this.serverFilterButton.checkExists();
    }

    checkVisiblePanel(): void {
        for (const element of [
            this.levelSelector,
            this.includeMessageInput,
            this.includeActorKeyInput,
            this.includeActorGroupInput,
            this.excludeActorKeyInput,
            this.excludeActorGroupInput,
            this.applyButton,
            this.sinceButton,
            this.tillButton,
        ]) {
            element.checkVisible();
        }
    }

    checkNotVisiblePanel(): void {
        for (const element of [
            this.levelSelector,
            this.includeMessageInput,
            this.includeActorKeyInput,
            this.includeActorGroupInput,
            this.excludeActorKeyInput,
            this.excludeActorGroupInput,
            this.applyButton,
        ]) {
            element.checkNotVisible();
        }
    }

    checkVisibleAllColumnMenu() {
        this.allColumnMenuButton.click();
        const text = ETableContextMenuSelectors.AllColumnMenuText;
        for (const value of [
            'Pin Column',
            'Autosize This Column',
            'Autosize All Columns',
            'Reset Columns',
        ]) {
            cy.contains(text, value);
        }
    }

    checkVisibleFilterMenu() {
        this.filterMenuInput.checkVisible();
    }

    checkVisibleColumnMenu() {
        this.columnMenuButton.click();
        this.checkVisibleColumns();
    }

    checkVisibleColumns() {
        for (const value of ['Time', 'Level', 'Component', 'Message', 'Actor Key', 'Actor Group']) {
            cy.contains(ETableContextMenuSelectors.ColumnMenuText, value);
        }
    }

    addColumn(nameColumns: string[]) {
        this.columnMenuButton.click();
        this.checkVisibleColumns();
        customWait(1);
        this.columnCheckboxOff.doubleClick();
        nameColumns.forEach((nameColumn) => this.columnMenuText.get().contains(nameColumn).click());
    }

    applyButtonClick() {
        this.applyButton.checkEnabled();
        this.applyButton.clickForce();
        this.checkVisiblePanel();
        customWait(1);
    }

    checkDateInCalendarByIndex(data: TDataTask, index) {
        this.sinceButton.get().should('contain.value', data.simStartTimes[index]);
        this.tillButton.get().should('contain.value', data.simEndTimes[index]);
    }
}

export const productLogsTab = new ProductLogsTab();
