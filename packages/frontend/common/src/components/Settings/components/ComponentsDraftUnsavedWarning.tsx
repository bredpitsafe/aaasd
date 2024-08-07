import { memo } from 'react';

import { useComponentsMetadataDraftUnsavedWarning } from '../hooks/useComponentsMetadataDraftUnsavedWarning';
import { SettingsSwitch } from '../Switch';

export const ComponentsDraftUnsavedWarning = memo(() => {
    const [value, onChange, , loading] = useComponentsMetadataDraftUnsavedWarning();

    return (
        <SettingsSwitch
            label="Unsaved components draft alert"
            checked={value}
            onChange={onChange}
            loading={loading}
        />
    );
});
