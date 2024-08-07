import { Given } from '@badeball/cypress-cucumber-preprocessor';

import { basePage } from '../../../../lib/base.page';
import { backtestingPage } from '../../../../lib/page-objects/backtesting/backtesting.page';
import { confirmModal } from '../../../../lib/page-objects/common/confirm.modal';
import { mainMenuModal } from '../../../../lib/page-objects/common/main-menu.modal';
import { herodotusTerminalPage } from '../../../../lib/page-objects/herodotus-terminal/herodotus-terminal.page';
import { customWait } from '../../../../lib/web-socket/server';

Given(`user clicks on "Robots" menu button`, () => {
    herodotusTerminalPage.robotsButton.click();
});

Given(`user adds a new "Status Messages" tab in the menu`, () => {
    mainMenuModal.openTabTable('Status Messages');
});

Given(`user clicks the "Reset Layout" button in the menu`, () => {
    backtestingPage.resetLayoutButton.click();
});

Given(`user opens the {string} tab`, (nameTable: string) => {
    basePage.openTabTable(nameTable);
    customWait(1);
});

Given(`user clicks on the "Open settings" button in the menu`, () => {
    mainMenuModal.openSettingsButton.click();
    confirmModal.confirmModal.checkContain('Settings');
    customWait(1);
});
