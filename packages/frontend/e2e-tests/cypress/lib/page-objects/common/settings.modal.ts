import { EMainMenuModalSelectors } from '@frontend/common/e2e/selectors/main-menu.modal.selectors';
import { ESettingsModalSelectors } from '@frontend/common/e2e/selectors/settings.modal.selectors';

import { Modal } from '../../base/elements/modal';
import { Select } from '../../base/elements/select';

class SettingsModal {
    readonly mainComponent = new Modal(ESettingsModalSelectors.SettingsModal);
    readonly serverSelect = new Select(EMainMenuModalSelectors.StageSwitchSelector);

    checkElementsExists(): void {
        this.mainComponent.checkExists();
    }
}

export const settingsModal = new SettingsModal();
