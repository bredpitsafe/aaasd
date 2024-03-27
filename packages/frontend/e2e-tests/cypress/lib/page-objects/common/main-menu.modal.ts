import { EMainMenuModalSelectors } from '@frontend/common/e2e/selectors/main-menu.modal.selectors';

import { Button } from '../../base/elements/button';
import { SelectVirtualList } from '../../base/elements/selectVirtualList';
import { Text } from '../../base/elements/text';

export class MainMenuModal {
    readonly resetLayout = new Button(EMainMenuModalSelectors.ResetLayoutButton);
    readonly addTabButton = new Button(EMainMenuModalSelectors.AddTabButton);
    readonly contextMenu = new Text(EMainMenuModalSelectors.ContextMenuText, false);
    readonly serverSelector = new SelectVirtualList(EMainMenuModalSelectors.StageSwitchSelector);
    readonly openSettingsButton = new SelectVirtualList(EMainMenuModalSelectors.OpenSettingsButton);

    selectServer(nameServer: string) {
        this.serverSelector.clickAndType(nameServer);
    }

    clickMenuVisiblyFilter(): void {
        this.resetLayout.checkVisible();
        this.addTabButton.checkVisible();
    }

    openTabTable(nameTable: string): void {
        this.addTabButton.click();
        this.contextMenu.containsClick(nameTable);
    }
}

export const mainMenuModal = new MainMenuModal();
