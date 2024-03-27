import { useMemo } from 'react';
import { map } from 'rxjs/operators';

import type { TSettingsStoreName } from '../../../actors/Settings/db';
import { useModule } from '../../../di/react';
import { ModuleSettings } from '../../../modules/settings';
import { useFunction } from '../../../utils/React/useFunction';
import { useSyncObservable } from '../../../utils/React/useSyncObservable';

export function useListSettings<T extends string = string>(
    appName: TSettingsStoreName,
    key: string,
    defaultValue: undefined | T[] = undefined,
): [undefined | T[], (value: T[]) => void, VoidFunction] {
    const { getAppSettings$, setAppSettings, deleteAppSettings } = useModule(ModuleSettings);

    const value$ = useMemo(
        () => getAppSettings$<T[]>(appName, key).pipe(map((v) => v ?? defaultValue)),
        [appName, getAppSettings$, key, defaultValue],
    );

    const rawValue = useSyncObservable(value$);

    const cbChangeValue = useFunction((newValue: T[]) => setAppSettings(appName, key, newValue));
    const cbDeleteValue = useFunction(() => deleteAppSettings(appName, key));

    const listKey = useMemo(() => rawValue?.sort().join('-'), [rawValue]);

    const value = useMemo(
        () => rawValue,
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [listKey],
    );

    return [value, cbChangeValue, cbDeleteValue];
}
