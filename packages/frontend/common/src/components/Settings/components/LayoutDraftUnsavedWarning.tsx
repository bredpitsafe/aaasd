import { memo } from 'react';

import { useLayoutDraftUnsavedWarning } from '../hooks/useLayoutDraftUnsavedWarning';
import { SettingsSwitch } from '../Switch';

export const LayoutDraftUnsavedWarning = memo(() => {
    const [value, onChange, , loading] = useLayoutDraftUnsavedWarning();

    return (
        <SettingsSwitch
            label="Unsaved layout alert"
            checked={value}
            onChange={onChange}
            loading={loading}
        />
    );
});
