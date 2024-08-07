import type { TStructurallyCloneable } from '@common/types';
import { useMemo } from 'react';

import { useModule } from '../../../di/react';
import { useAppName } from '../../../hooks/useAppName';
import { useAppSettings } from '../../../hooks/useAppSettings';
import { ModuleSettings } from '../../../modules/settings';
import { useFunction } from '../../../utils/React/useFunction';
import { useNotifiedObservableFunction } from '../../../utils/React/useObservableFunction';
import {
    isLoadingValueDescriptor,
    isSyncedValueDescriptor,
} from '../../../utils/ValueDescriptor/utils';

export function useListSettings<T extends string = string>(
    key: string,
    defaultValue: undefined | T[] = undefined,
): [undefined | T[], (value: T[]) => void, VoidFunction, boolean] {
    const { setAppSettings, deleteAppSettings } = useModule(ModuleSettings);
    const appName = useAppName();

    const settings = useAppSettings(appName, key);

    const rawValue = isSyncedValueDescriptor(settings)
        ? settings.value ?? defaultValue
        : defaultValue;

    const [setValue, upsertState] = useNotifiedObservableFunction(
        (value: TStructurallyCloneable) => {
            return setAppSettings({ appName, key, value });
        },
        {
            mapError: () => ({ message: `Failed to update ${key}` }),
            getNotifyTitle: () => ({
                loading: `Updating ${key}...`,
                success: `${key} updated successfully`,
            }),
        },
    );

    const [deleteValue, deleteState] = useNotifiedObservableFunction(
        () => {
            return deleteAppSettings(appName, key);
        },
        {
            mapError: () => ({ message: `Failed to delete ${key}` }),
            getNotifyTitle: () => ({
                loading: `Deleting ${key} from UserSettings...`,
                success: `${key} deleted successfully`,
            }),
        },
    );

    const isGetSettingsLoading = isLoadingValueDescriptor(settings);
    const isSetSettingsLoading = isLoadingValueDescriptor(upsertState);
    const isDeleteSettingsLoading = isLoadingValueDescriptor(deleteState);

    const isLoading = isSetSettingsLoading || isDeleteSettingsLoading || isGetSettingsLoading;

    const cbChangeValue = useFunction((newValue: T[]) => setValue(newValue));
    const cbDeleteValue = useFunction(() => deleteValue());

    const listKey = useMemo(() => (rawValue as T[])?.sort().join('-'), [rawValue]);

    const value = useMemo(
        () => rawValue,
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [listKey],
    );

    return [value as T[], cbChangeValue, cbDeleteValue, isLoading];
}
