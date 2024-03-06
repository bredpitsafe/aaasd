import { EModalSelectors } from '@frontend/common/e2e/selectors/modal.selectors';

import { Button } from '../../base/elements/button';
import { Input } from '../../base/elements/input';
import { Modal } from '../../base/elements/modal';
import { SelectVirtualList } from '../../base/elements/selectVirtualList';

export enum EConfirmModalSelectors {
    ConfirmModal = '[class=ant-modal-content]',
    OkButton = '[class=ant-modal-body] button[class*=primary]',
    CancelButton = '[class=ant-modal-body] button[class*=default]',
    CloseButton = '[class=ant-modal-close-x]',
    ItemSelector = '[class=ant-select-selection-item]',
}
export class ConfirmModal {
    readonly confirmModal = new Modal(EConfirmModalSelectors.ConfirmModal, false);
    readonly okButton = new Button(EConfirmModalSelectors.OkButton, false);
    readonly cancelButton = new Button(EConfirmModalSelectors.CancelButton, false);
    readonly closeButton = new Button(EConfirmModalSelectors.CloseButton, false);
    readonly itemSelector = new SelectVirtualList(EConfirmModalSelectors.ItemSelector, false);
    readonly nameComponentInput = new Input(EModalSelectors.NameComponentInput);

    clickOkButton(): void {
        this.confirmModal.checkVisible();
        this.okButton.checkVisible();
        this.okButton.click();
    }
    checkContainModal(nameList: string[]): void {
        nameList.forEach((name) => confirmModal.confirmModal.get().contains(name));
    }
}

export const confirmModal = new ConfirmModal();
