import { isNil } from 'lodash-es';

import type { TSettingsStoreName } from '../../../actors/Settings/db';
import { useFunction } from '../../../utils/React/useFunction';
import { useSingleSettings } from './useSingleSettings';

export function useBooleanSettings(
    appName: TSettingsStoreName,
    key: string,
    defaultValue = false,
): [boolean, (value?: boolean) => void, VoidFunction] {
    const [value, onChange, onDelete] = useSingleSettings<boolean>(appName, key, defaultValue);

    const cbToggle = useFunction((newValue?: boolean) =>
        onChange(isNil(newValue) ? !value : newValue),
    );

    return [value, cbToggle, onDelete];
}
