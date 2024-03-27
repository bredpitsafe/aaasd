import { EDialogModalSelectors } from '@frontend/common/e2e/selectors/dialog.modal.selectors';

import { Button } from '../../base/elements/button';
import { Input } from '../../base/elements/input';

class DialogModal {
    readonly nameInput = new Input(EDialogModalSelectors.NameInput);
    readonly cancelButton = new Button(EDialogModalSelectors.CancelButton);
    readonly thisWindowButton = new Button(EDialogModalSelectors.ThisWindowButton);

    checkElementsExists(): void {
        this.nameInput.checkExists();
        this.cancelButton.checkExists();
    }

    checkElementsVisible(): void {
        this.nameInput.checkVisible();
        this.cancelButton.checkVisible();
    }
}

export const dialogModal = new DialogModal();
