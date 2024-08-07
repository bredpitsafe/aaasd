import { EMainMenuModalSelectors } from '@frontend/common/e2e/selectors/main-menu.modal.selectors';

import { Button } from '../../base/elements/button';
import { Select } from '../../base/elements/select';
import { Text } from '../../base/elements/text';

export class MainMenuModal {
    readonly resetLayout = new Button(EMainMenuModalSelectors.ResetLayoutButton);
    readonly addTabButton = new Button(EMainMenuModalSelectors.AddTabButton);
    readonly contextMenu = new Text(EMainMenuModalSelectors.ContextMenuText, false);
    readonly serverSelector = new Select(EMainMenuModalSelectors.StageSwitchSelector);
    readonly openSettingsButton = new Button(EMainMenuModalSelectors.OpenSettingsButton);
    readonly openSocketsButton = new Button(EMainMenuModalSelectors.OpenSocketsButton);
    readonly openSubscriptionsTableButton = new Button(
        EMainMenuModalSelectors.OpenSubscriptionsTableButton,
        false,
    );
    readonly closeSocketButton = new Button(EMainMenuModalSelectors.CloseSocketButton, false);
    readonly closeSubscriptionsTableButton = new Button(
        EMainMenuModalSelectors.CloseSubscriptionsTableButton,
        false,
    );

    selectServer(nameServer: string) {
        this.serverSelector.clickTypeTextAndEnter(nameServer);
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
