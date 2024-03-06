import { SettingsSwitch } from '@frontend/common/src/components/Settings/Switch';
import { memo } from 'react';

import { useShowLocalhostSocket } from './hooks/useShowLocalhostSocket';

export const ShowLocalhost = memo(() => {
    const [showLocalhost, onToggleShowLocalhost] = useShowLocalhostSocket();

    return (
        <>
            <SettingsSwitch
                label="Show localhost in stage selector"
                checked={showLocalhost}
                onChange={onToggleShowLocalhost}
            />
        </>
    );
});
