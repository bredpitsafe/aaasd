import { memo } from 'react';

import { useSyncLayouts } from '../hooks/useSyncLayouts';
import { SettingsSwitch } from '../Switch';

export const SyncLayouts = memo(() => {
    const [syncLayouts, onChangeSyncLayouts] = useSyncLayouts();

    return (
        <SettingsSwitch
            label="Sync layout changes between app tabs"
            checked={syncLayouts}
            onChange={onChangeSyncLayouts}
        />
    );
});
