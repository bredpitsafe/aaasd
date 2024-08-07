import { EDashboardEditModal } from '@frontend/common/e2e/selectors/dashboard/dashboard.edit.modal';
import { EConfigTabSelectors } from '@frontend/common/e2e/selectors/trading-servers-manager/components/config-tab/config.tab.selectors';

import { Text } from '../../base/elements/text';
import { UploadFile } from '../../base/elements/uploadFile';
import { ConfigTab } from '../trading-servers-manager/components/config-tab/config.tab';

class DashboardEditModal extends ConfigTab {
    readonly chartsForm = new Text(EDashboardEditModal.ChartsForm);
    readonly applyChartsButton = new Text(EDashboardEditModal.ApplyChartsButton);
    readonly discardChartsButton = new UploadFile(EDashboardEditModal.DiscardChartsButton);
    readonly panelPlusIconButton = new UploadFile(EDashboardEditModal.PanelPlusIconButton, false);
    readonly inputQueryPanel = new UploadFile(EDashboardEditModal.InputQueryPanel, false);

    checkVisibleEditConfigForm(namePanel: string): void {
        this.applyButton.checkVisible();
        this.discardButton.checkVisible();
        this.diffButton.checkVisible();
        switch (namePanel) {
            case 'Chart':
                this.configForm.checkContain('ETHUSDT|Binance.l1.ask.rep.0.1');
                break;
            case 'Table':
                this.configForm.checkContain('CustomViewTable');
                break;
            case 'Grid':
                this.configForm.checkContain('CustomViewGrid');
                break;
        }
    }

    checkVisibleEditChartForm(): void {
        this.applyChartsButton.checkVisible();
        this.discardChartsButton.checkVisible();
        this.panelPlusIconButton.checkVisible();
    }

    checkElementsChartsNotEnable(): void {
        this.applyChartsButton.checkNotEnabled();
        this.discardChartsButton.checkNotEnabled();
    }

    checkElementsChartsEnable(): void {
        this.applyChartsButton.checkEnabled();
        this.discardChartsButton.checkEnabled();
    }

    setConfig(nameFile: string) {
        cy.readFile(nameFile).then((text) => {
            cy.get(EConfigTabSelectors.ConfigInput).type(text, {
                force: true,
                delay: 0,
                parseSpecialCharSequences: false,
            });
        });
    }
}

export const dashboardEditModal = new DashboardEditModal();
