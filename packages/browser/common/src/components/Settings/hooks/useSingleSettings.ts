import { useMemo } from 'react';

import type { TSettingsStoreName } from '../../../actors/Settings/db';
import { useModule } from '../../../di/react';
import { ModuleSettings } from '../../../modules/settings';
import { useFunction } from '../../../utils/React/useFunction';
import { useSyncObservable } from '../../../utils/React/useSyncObservable';

export type TUseSingleValueReturnType<T> = [T, (value: T) => void, VoidFunction];
export function useSingleSettings<T>(
    appName: TSettingsStoreName,
    key: string,
    defaultValue: T,
): TUseSingleValueReturnType<T> {
    const { getAppSettings$, setAppSettings, deleteAppSettings } = useModule(ModuleSettings);
    const value$ = useMemo(() => getAppSettings$<T>(appName, key), [appName, getAppSettings$, key]);
    const value = useSyncObservable(value$) ?? defaultValue;
    const cbChangeValue = useFunction((newValue: T) => setAppSettings(appName, key, newValue));
    const cbDeleteValue = useFunction(() => deleteAppSettings(appName, key));

    return [value, cbChangeValue, cbDeleteValue];
}
