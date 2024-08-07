import { SettingsSwitch } from '@frontend/common/src/components/Settings/Switch';
import { memo } from 'react';

import { usePanelDefaultCollapseSettings } from './hooks/usePanelDefaultCollapseSettings';

export const PanelCollapse = memo(() => {
    const [defaultCollapsed, toggleDefaultCollapsed, , loading] = usePanelDefaultCollapseSettings();

    return (
        <SettingsSwitch
            label="Single-row panel labels"
            checked={defaultCollapsed}
            onChange={toggleDefaultCollapsed}
            loading={loading}
        />
    );
});
