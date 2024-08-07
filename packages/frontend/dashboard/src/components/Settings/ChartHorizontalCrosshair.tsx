import { SettingsSwitch } from '@frontend/common/src/components/Settings/Switch';
import { memo } from 'react';

import { useShowHorizontalCrosshair } from './hooks/useShowHorizontalCrosshair';

export const ChartHorizontalCrosshair = memo(() => {
    const [showPseudoHorizontalCrosshair, onTogglePseudoHorizontalCrosshair, , loading] =
        useShowHorizontalCrosshair();

    return (
        <SettingsSwitch
            label="Show sync horizontal crosshair"
            checked={showPseudoHorizontalCrosshair}
            onChange={onTogglePseudoHorizontalCrosshair}
            loading={loading}
        />
    );
});
