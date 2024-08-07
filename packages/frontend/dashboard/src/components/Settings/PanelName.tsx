import { SettingsSwitch } from '@frontend/common/src/components/Settings/Switch';
import { memo } from 'react';

import { usePanelNameInCompactMode } from './hooks/usePanelNameInCompactMode';

export const PanelName = memo(() => {
    const [showLabel, changeShowLabel, , loading] = usePanelNameInCompactMode();

    return (
        <SettingsSwitch
            label="Show non-empty panel labels in compact mode"
            checked={showLabel}
            onChange={changeShowLabel}
            loading={loading}
        />
    );
});
