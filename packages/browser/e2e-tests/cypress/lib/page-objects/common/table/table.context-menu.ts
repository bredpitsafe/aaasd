import { Button } from '../../../base/elements/button';
import { Input } from '../../../base/elements/input';
import { Text } from '../../../base/elements/text';

export enum ETableContextMenuSelectors {
    HeaderMenu = '[class*="ag-tabs ag-menu"]',
    AllColumnMenuButton = '[class="ag-icon ag-icon-menu"]',
    AllColumnMenuText = '[class*="ag-menu-option-text"]',
    FilterMenuInput = '[class="ag-tabs-body ag-menu-body"]',
    ColumnMenuButton = '[class="ag-icon ag-icon-columns"]',
    ColumnMenuText = '[class="ag-column-select-column-label"]',
    ColumnCheckboxList = '[class*="ag-column-select-virtual-list-item"] [type="checkbox"]',
    ColumnCheckboxOff = '[aria-label="Toggle Select All Columns"]',
}
export class TableContextMenu {
    readonly headerMenu = new Text(ETableContextMenuSelectors.HeaderMenu, false);
    readonly allColumnMenuButton = new Button(
        ETableContextMenuSelectors.AllColumnMenuButton,
        false,
    );
    readonly allColumnMenuText = new Text(ETableContextMenuSelectors.AllColumnMenuText, false);
    readonly filterMenuInput = new Input(ETableContextMenuSelectors.FilterMenuInput, false);
    readonly columnMenuButton = new Button(ETableContextMenuSelectors.ColumnMenuButton, false);
    readonly columnMenuText = new Text(ETableContextMenuSelectors.ColumnMenuText, false);
    readonly columnCheckboxList = new Button(ETableContextMenuSelectors.ColumnCheckboxList, false);
    readonly columnCheckboxOff = new Button(ETableContextMenuSelectors.ColumnCheckboxOff, false);
}

export const tableContextMenu = new TableContextMenu();
