import { Modal } from '../../base/elements/modal';

export enum EComponentsModalSelectors {
    TabsPanel = '[class*=e2e-tests-tabs-panel]',
}

class ComponentsModal {
    readonly tabsPanel = new Modal(EComponentsModalSelectors.TabsPanel, false);

    checkVisibleTabsPanel(): void {
        this.tabsPanel.checkExists();
        this.tabsPanel.checkVisible();
    }

    selectTabByName(tabName: string): void {
        this.tabsPanel
            .get()
            .should('exist')
            .should('be.visible')
            .should('contain', tabName)
            .contains(tabName)
            .click();
    }

    checkNewTabOpen(nameTab) {
        this.tabsPanel.get().last().contains(nameTab);
    }
}

export const componentsModal = new ComponentsModal();
