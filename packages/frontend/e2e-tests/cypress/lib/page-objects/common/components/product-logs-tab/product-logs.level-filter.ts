import { Button } from '../../../../base/elements/button';
import { Text } from '../../../../base/elements/text';

export enum EProductLogsLevelFilterSelectors {
    InfoFilterText = '[title="Info"]',
    WarnFilterText = '[title="Warn"]',
    ErrorFilterText = '[title="Error"]',
    InfoCloseButton = '[title="Info"] [class="anticon anticon-close"]',
    WarnCloseButton = '[title="Warn"] [class="anticon anticon-close"]',
    ErrorCloseButton = '[title="Error"] [class="anticon anticon-close"]',
}
export class ProductLogsLevelFilter {
    readonly infoFilterText = new Text(EProductLogsLevelFilterSelectors.InfoFilterText, false);
    readonly warnFilterText = new Text(EProductLogsLevelFilterSelectors.WarnFilterText, false);
    readonly errorFilterText = new Text(EProductLogsLevelFilterSelectors.ErrorFilterText, false);
    readonly infoCloseButton = new Button(EProductLogsLevelFilterSelectors.InfoCloseButton, false);
    readonly warnCloseButton = new Button(EProductLogsLevelFilterSelectors.WarnCloseButton, false);
    readonly errorCloseButton = new Button(
        EProductLogsLevelFilterSelectors.ErrorCloseButton,
        false,
    );

    checkVisibleLevelFilters() {
        this.infoFilterText.checkVisible();
        this.warnFilterText.checkVisible();
        this.errorFilterText.checkVisible();
    }

    clearLevelFilters() {
        this.infoCloseButton.click();
        this.warnCloseButton.click();
        this.errorCloseButton.click();
    }

    clearLevelFilter(nameFilter: string) {
        switch (nameFilter) {
            case 'Error':
                this.errorCloseButton.click();
                break;
            case 'Warn':
                this.warnCloseButton.click();
                break;
            case 'Info':
                this.infoCloseButton.click();
                break;
        }
    }
}

export const productLogsLevelFilter = new ProductLogsLevelFilter();
