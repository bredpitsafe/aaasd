import { SettingsSwitch } from '@frontend/common/src/components/Settings/Switch';
import { memo } from 'react';

import { usePanelDeleteConfirmSettings } from './hooks/usePanelDeleteConfirmSettings';

export const PanelConfirmDelete = memo(() => {
    const [confirmPanelDelete, onToggleConfirmPanelDelete, , loading] =
        usePanelDeleteConfirmSettings();

    return (
        <SettingsSwitch
            label="Confirm panel delete"
            checked={confirmPanelDelete}
            onChange={onToggleConfirmPanelDelete}
            loading={loading}
        />
    );
});
