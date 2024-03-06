import { EModalSelectors } from '@frontend/common/e2e/selectors/modal.selectors';

import { Button } from '../../../base/elements/button';
import { Text } from '../../../base/elements/text';
import { confirmModal } from '../../common/confirm.modal';

export class NewAccountModal {
    readonly newAccountModal = new Text(EModalSelectors.Modal, false);
    readonly closeButton = new Button(EModalSelectors.CloseButton, false);
    readonly cancelButton = new Button(EModalSelectors.CancelButton);
    readonly saveButton = new Button(EModalSelectors.SaveButton);

    checkElementsExists(): void {
        this.newAccountModal.checkExists();
        this.closeButton.checkExists();
        this.cancelButton.checkEnabled();
        this.saveButton.checkNotEnabled();
    }

    clickClosedButton(): void {
        this.closeButton.checkVisible();
        this.closeButton.click();
        this.newAccountModal.checkNotExists();
    }

    clickCancelButton(): void {
        this.cancelButton.checkVisible();
        this.cancelButton.click();
        this.newAccountModal.checkNotExists();
    }

    clickSaveButton(): void {
        this.saveButton.checkVisible();
        this.saveButton.checkEnabled();
        this.saveButton.click();
        confirmModal.clickOkButton();
    }
}

export const newAccountModal = new NewAccountModal();
