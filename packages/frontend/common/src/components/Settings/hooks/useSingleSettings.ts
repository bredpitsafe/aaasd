import type { TStructurallyCloneable } from '@common/types';
import type { EApplicationName } from '@common/types';

import { useModule } from '../../../di/react';
import { useAppSettings } from '../../../hooks/useAppSettings';
import { ModuleSettings } from '../../../modules/settings';
import { useFunction } from '../../../utils/React/useFunction';
import { useNotifiedObservableFunction } from '../../../utils/React/useObservableFunction';
import { isLoadingValueDescriptor } from '../../../utils/ValueDescriptor/utils';

export type TUseSingleValueReturnType<T> = [T, (value: T) => void, VoidFunction, boolean];

export function useSingleSettings<T extends TStructurallyCloneable>(
    appName: EApplicationName,
    key: string,
    defaultValue: T,
): TUseSingleValueReturnType<T> {
    const { setAppSettings, deleteAppSettings } = useModule(ModuleSettings);

    const settings = useAppSettings(appName, key);

    const value = settings.value ?? defaultValue;

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
        () => deleteAppSettings(appName, key),
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

    const cbChangeValue = useFunction((value: T) => setValue(value));
    const cbDeleteValue = useFunction(() => deleteValue());

    return [value as T, cbChangeValue, cbDeleteValue, isLoading];
}
