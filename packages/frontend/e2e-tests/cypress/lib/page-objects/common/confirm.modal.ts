import { testSelector } from '@frontend/common/e2e';
import { EModalSelectors } from '@frontend/common/e2e/selectors/modal.selectors';

import { Button } from '../../base/elements/button';
import { Input } from '../../base/elements/input';
import { Modal } from '../../base/elements/modal';
import { Select } from '../../base/elements/select';
import { customWait } from '../../web-socket/server';

export enum EConfirmModalSelectors {
    ConfirmModal = '[class=ant-modal-content]',
    OkButton = '[class="ant-modal-content"] [class*=primary]',
    CancelButton = '[class="ant-modal-content"] [class*=default]',
    CloseButton = '[class=ant-modal-close-x]',
    ItemSelector = '[class=ant-select-selection-item]',
}
export class ConfirmModal {
    readonly confirmModal = new Modal(EConfirmModalSelectors.ConfirmModal, false);
    readonly okButton = new Button(EConfirmModalSelectors.OkButton, false);
    readonly cancelButton = new Button(EConfirmModalSelectors.CancelButton, false);
    readonly closeButton = new Button(EConfirmModalSelectors.CloseButton, false);
    readonly itemSelector = new Select(EConfirmModalSelectors.ItemSelector, false);
    readonly nameComponentInput = new Input(EModalSelectors.NameComponentInput);
    readonly serviceStageSelector = new Select(EModalSelectors.ServiceStageSelector);
    readonly bffStageSelector = new Select(EModalSelectors.BFFStageSelector);
    readonly tabsCoinFilterInput = new Input(EModalSelectors.TabsCoinFilterInput);
    readonly excludedStrategiesFilterInput = new Input(
        EModalSelectors.ExcludedStrategiesFilterInput,
    );
    readonly removeButton = new Button(EModalSelectors.RemoveButton, false);
    readonly checkedSelectRow = new Button(EModalSelectors.CheckedSelectRow, false);

    clickOkButton(): void {
        this.confirmModal.checkVisible();
        this.okButton.checkVisible();
        this.okButton.containsClick('OK');
    }
    checkContainModal(nameList: string[]): void {
        nameList.forEach((name) => confirmModal.confirmModal.get().contains(name));
    }

    checkNotContainModal(nameList: string[]): void {
        nameList.forEach((name) =>
            confirmModal.confirmModal.get().should('not.contain.text', name),
        );
    }

    setTabsCoinFilter(nameTabs: string[]) {
        customWait(0.2);
        this.tabsCoinFilterInput.click();
        nameTabs.forEach((nameIndicator) => {
            this.tabsCoinFilterInput.selectsByText(nameIndicator);
            customWait(0.2);
        });
        customWait(0.2);
        this.closeButton.click();
    }

    resetTabsCoinFilter() {
        const deletedButton = EModalSelectors.RemoveButton;

        cy.get(testSelector(EModalSelectors.TabsCoinFilterInput))
            .should('be.visible')
            .then(($element) => {
                if ($element.find(deletedButton).length > 0) {
                    this.tabsCoinFilterInput.click();
                    confirmModal.checkedSelectRow.get().each(($ele) => {
                        customWait(0.2);
                        cy.wrap($ele).click();
                    });
                }
            });
        this.closeButton.click();
    }

    setExcludedStrategiesFilter(namesStrategies: string[]) {
        this.excludedStrategiesFilterInput.click();
        namesStrategies.forEach((nameIndicator) => {
            this.excludedStrategiesFilterInput.selectsByText(nameIndicator);
            customWait(0.2);
        });
        customWait(0.2);
        this.closeButton.click();
    }

    resetExcludedStrategiesFilter() {
        const deletedButton = EModalSelectors.RemoveButton;

        cy.get(testSelector(EModalSelectors.ExcludedStrategiesFilterInput))
            .should('be.visible')
            .then(($element) => {
                if ($element.find(deletedButton).length > 0) {
                    confirmModal.removeButton.get().each(($ele) => {
                        customWait(0.2);
                        cy.wrap($ele).click();
                    });
                }
            });
        customWait(0.2);
        this.closeButton.click();
    }
}

export const confirmModal = new ConfirmModal();
