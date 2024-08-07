import type {
    EApplicationName,
    TimeZone,
    TStructurallyCloneable,
    TTimeZoneInfo,
} from '@common/types';
import { TimeZoneList } from '@common/types';
import { getTimeZoneCurrentUtcOffset } from '@common/utils';
import { isNil } from 'lodash-es';
import { useEffect, useMemo } from 'react';

import { useModule } from '../../../di/react';
import { useAppName } from '../../../hooks/useAppName';
import { ModuleSettings } from '../../../modules/settings';
import { useFunction } from '../../../utils/React/useFunction';
import { useNotifiedObservableFunction } from '../../../utils/React/useObservableFunction';
import { useSyncObservable } from '../../../utils/React/useSyncObservable';
import { ModuleNotifyErrorAndFail } from '../../../utils/Rx/ModuleNotify';
import { extractSyncedValueFromValueDescriptor } from '../../../utils/Rx/ValueDescriptor2';
import { isLoadingValueDescriptor } from '../../../utils/ValueDescriptor/utils';
import { ECommonSettings } from '../def';

export function useTimeZoneInfoSettings(
    defaultValue = TimeZoneList.UTC,
): [TTimeZoneInfo, (value: TimeZone, guessLocal: boolean) => void, VoidFunction, boolean] {
    const appName = useAppName();
    const notifyErrorAndFail = useModule(ModuleNotifyErrorAndFail);

    const defaultTimeZoneInfo = useMemo<TTimeZoneInfo>(
        () => ({
            timeZone: defaultValue,
            utcOffset: getTimeZoneCurrentUtcOffset(defaultValue),
            guessLocal: false,
        }),
        [defaultValue],
    );

    const syncStorageTimeZone = getStorageTimeZone(appName);
    const syncStorageTimeZoneInfo = useMemo<TTimeZoneInfo | undefined>(
        () =>
            isNil(syncStorageTimeZone)
                ? undefined
                : {
                      timeZone: syncStorageTimeZone,
                      utcOffset: getTimeZoneCurrentUtcOffset(syncStorageTimeZone),
                      guessLocal: false,
                  },
        [syncStorageTimeZone],
    );

    const { getAppSettings$, setAppSettings, deleteAppSettings } = useModule(ModuleSettings);

    const value$ = useMemo(
        () =>
            getAppSettings$(appName, ECommonSettings.TimeZone).pipe(
                notifyErrorAndFail(),
                extractSyncedValueFromValueDescriptor(),
            ),
        [appName, getAppSettings$, notifyErrorAndFail],
    );

    const value =
        //@ts-ignore
        useSyncObservable<TTimeZoneInfo>(value$, syncStorageTimeZoneInfo) ?? defaultTimeZoneInfo;
    const [setValue, upsertState, upsertError] = useNotifiedObservableFunction(
        (value: TStructurallyCloneable) => {
            return setAppSettings({ appName, key: ECommonSettings.TimeZone, value });
        },
        {
            mapError: () => ({ message: `Failed to update ${ECommonSettings.TimeZone}` }),
            getNotifyTitle: () => ({
                loading: `Updating ${ECommonSettings.TimeZone}...`,
                success: `${ECommonSettings.TimeZone} updated successfully`,
            }),
        },
    );

    const [deleteValue, deleteState, deleteError] = useNotifiedObservableFunction(
        () => {
            return deleteAppSettings(appName, ECommonSettings.TimeZone);
        },
        {
            mapError: () => ({ message: `Failed to delete ${ECommonSettings.TimeZone}` }),
            getNotifyTitle: () => ({
                loading: `Deleting ${ECommonSettings.TimeZone} from UserSettings...`,
                success: `${ECommonSettings.TimeZone} deleted successfully`,
            }),
        },
    );
    const cbChangeValue = useFunction((timeZone: TimeZone, guessLocal: boolean) => {
        setStorageTimeZone(appName, timeZone);

        setValue({
            timeZone,
            utcOffset: getTimeZoneCurrentUtcOffset(timeZone),
            guessLocal,
        });
    });
    const cbDeleteValue = useFunction(() => {
        setStorageTimeZone(appName, undefined);

        deleteValue();
    });

    const isSetSettingsLoading = isLoadingValueDescriptor(upsertState);
    const isDeleteSettingsLoading = isLoadingValueDescriptor(deleteState);

    const isLoading = isSetSettingsLoading || isDeleteSettingsLoading;

    useEffect(() => {
        if (upsertError && value !== syncStorageTimeZoneInfo) {
            setStorageTimeZone(appName, value.timeZone);
        }
    }, [upsertError, value, syncStorageTimeZoneInfo, appName]);

    useEffect(() => {
        if (deleteError) {
            setStorageTimeZone(appName, value.timeZone);
        }
    }, [deleteError, value, appName]);

    return [value, cbChangeValue, cbDeleteValue, isLoading];
}

function getSyncStorageKey(appName: EApplicationName): string {
    return `SYNC_STORAGE_TIMEZONE_${appName}`;
}

function getStorageTimeZone(appName: EApplicationName): undefined | TimeZone {
    return (localStorage.getItem(getSyncStorageKey(appName)) as TimeZone) ?? undefined;
}

function setStorageTimeZone(appName: EApplicationName, timeZone: undefined | TimeZone) {
    const key = getSyncStorageKey(appName);

    if (isNil(timeZone)) {
        localStorage.removeItem(key);
    } else {
        localStorage.setItem(key, timeZone);
    }
}
