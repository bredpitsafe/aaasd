import { Text } from '../../base/elements/text';

export enum EContextMenuSelectors {
    ContextMenu = '[class*="ag-menu-option"]',
}
class ContextMenu {
    readonly contextMenu = new Text(EContextMenuSelectors.ContextMenu, false);

    checkVisibleContextMenu(nameTab: string): void {
        for (const name of [
            'Clone',
            'Fill form from this task',
            'Charts',
            'Charts (new window)',
            'Trades',
            'Trades (new window)',
            'Copy',
            'Copy with Headers',
            'Copy Cell',
            'Export',
        ]) {
            this.contextMenu.contains(name);
        }
        nameTab === 'Active Tasks'
            ? this.contextMenu.contains('Archive')
            : this.contextMenu.contains('Delete');
    }
}
export const contextMenu = new ContextMenu();
