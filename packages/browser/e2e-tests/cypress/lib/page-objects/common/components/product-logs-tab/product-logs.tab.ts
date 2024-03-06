import { EProductLogsTabSelectors } from '@frontend/common/e2e/selectors/trading-servers-manager/components/product-logs-tab/product-logs.tab.selectors';

import { Button } from '../../../../base/elements/button';
import { Input } from '../../../../base/elements/input';
import { SelectVirtualList } from '../../../../base/elements/selectVirtualList';
import { TDataTask } from '../../../../interfaces/backtesting/dataTack';
import { customWait } from '../../../../web-socket/server';
import { ETableContextMenuSelectors, TableContextMenu } from '../../table/table.context-menu';

class ProductLogsTab extends TableContextMenu {
    readonly serverFilterButton = new Button(EProductLogsTabSelectors.ServerFilterButton);
    readonly sinceButton = new Input(EProductLogsTabSelectors.SinceButton);
    readonly tillButton = new Input(EProductLogsTabSelectors.TillButton);
    readonly levelSelector = new SelectVirtualList(EProductLogsTabSelectors.LevelSelector);
    readonly includeMessageInput = new SelectVirtualList(
        EProductLogsTabSelectors.IncludeMessageInput,
    );
    readonly includeActorKeyInput = new SelectVirtualList(
        EProductLogsTabSelectors.IncludeActorKeyInput,
    );
    readonly includeActorGroupInput = new SelectVirtualList(
        EProductLogsTabSelectors.IncludeActorGroupInput,
    );
    readonly excludeMessageInput = new SelectVirtualList(
        EProductLogsTabSelectors.ExcludeMessageInput,
    );
    readonly excludeActorKeyInput = new SelectVirtualList(
        EProductLogsTabSelectors.ExcludeActorKeyInput,
    );
    readonly excludeActorGroupInput = new SelectVirtualList(
        EProductLogsTabSelectors.ExcludeActorGroupInput,
    );
    readonly applyButton = new Button(EProductLogsTabSelectors.ApplyButton);

    constructor() {
        super();
    }

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
