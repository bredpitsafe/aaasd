import { SettingsSwitch } from '@frontend/common/src/components/Settings/Switch';
import { memo } from 'react';

import { useShowCoinIcons } from './hooks/useShowCoinIcons';

export const ShowCoinIcons = memo(() => {
    const [showCoinIcon, onToggleShowCoinIcons, , loading] = useShowCoinIcons();

    return (
        <SettingsSwitch
            label="Show coin icons"
            checked={showCoinIcon}
            onChange={onToggleShowCoinIcons}
            loading={loading}
        />
    );
});
