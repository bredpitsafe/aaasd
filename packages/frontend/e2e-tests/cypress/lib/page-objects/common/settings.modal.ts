import { ESettingsModalSelectors } from '@frontend/common/e2e/selectors/settings.modal.selectors';

import { Modal } from '../../base/elements/modal';
import { SelectVirtualList } from '../../base/elements/selectVirtualList';

class SettingsModal {
    readonly mainComponent = new Modal(ESettingsModalSelectors.SettingsModal);
    readonly serverSelect = new SelectVirtualList(ESettingsModalSelectors.ServerSelect);

    checkElementsExists(): void {
        this.mainComponent.checkExists();
    }
}

export const settingsModal = new SettingsModal();
