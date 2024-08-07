import { EMainMenuModalSelectors } from '@frontend/common/e2e/selectors/main-menu.modal.selectors';

import { Text } from './base/elements/text';
import { EServer } from './interfaces/server/server-interfaces';
import { MainMenuModal } from './page-objects/common/main-menu.modal';

export enum EBasePagePageSelectors {
    TabsPanel = '[class*=flexlayout__tabset_tabbar_outer]',

    CloseButton = '[data-layout-path*="close"]',
}

export class BasePage extends MainMenuModal {
    readonly mainMenuBar = new Text(EMainMenuModalSelectors.MainMenuBar);
    readonly tabsPanel = new Text(EBasePagePageSelectors.TabsPanel, false);
    readonly closeButton = new Text(EBasePagePageSelectors.CloseButton, false);
    static backendServerName: EServer;
    pageUrl: string;
    loadingIcon: Text;

    constructor(PAGE_URL = '') {
        super();
        this.pageUrl = PAGE_URL;
        this.loadingIcon = new Text('[aria-label*="loading"]', false);
    }

    visit(url?: string): Cypress.Chainable<Cypress.AUTWindow> {
        const defaultUrl = url ?? '';
        return cy.visit(this.pageUrl + defaultUrl);
    }
}

export const basePage = new BasePage();
