import { SettingsSwitch } from '@frontend/common/src/components/Settings/Switch';
import { memo } from 'react';

import { useShowPseudoHorizontalCrosshairTooltips } from './hooks/useShowPseudoHorizontalCrosshairTooltips';

export const ChartsTooltips = memo(() => {
    const [showChartsTooltips, onToggleChartsTooltips, , loading] =
        useShowPseudoHorizontalCrosshairTooltips();

    return (
        <SettingsSwitch
            label="Show sync charts tooltips"
            checked={showChartsTooltips}
            onChange={onToggleChartsTooltips}
            loading={loading}
        />
    );
});
