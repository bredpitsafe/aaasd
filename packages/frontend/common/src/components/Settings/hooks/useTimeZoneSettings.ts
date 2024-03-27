import { isNil } from 'lodash-es';
import { useMemo } from 'react';

import type { TSettingsStoreName } from '../../../actors/Settings/db';
import { useModule } from '../../../di/react';
import { ModuleSettings } from '../../../modules/settings';
import { TimeZone, TimeZoneList, TTimeZoneInfo } from '../../../types/time';
import { useFunction } from '../../../utils/React/useFunction';
import { useSyncObservable } from '../../../utils/React/useSyncObservable';
import { getTimeZoneCurrentUtcOffset } from '../../../utils/time';
import { ECommonSettings } from '../def';

export function useTimeZoneInfoSettings(
    appName: TSettingsStoreName,
    defaultValue = TimeZoneList.UTC,
): [TTimeZoneInfo, (value: TimeZone, guessLocal: boolean) => void, VoidFunction] {
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
        () => getAppSettings$<TTimeZoneInfo>(appName, ECommonSettings.TimeZone),
        [appName, getAppSettings$],
    );
    const value = useSyncObservable(value$, syncStorageTimeZoneInfo) ?? defaultTimeZoneInfo;
    const cbChangeValue = useFunction((timeZone: TimeZone, guessLocal: boolean) => {
        setStorageTimeZone(appName, timeZone);

        setAppSettings<TTimeZoneInfo>(appName, ECommonSettings.TimeZone, {
            timeZone,
            utcOffset: getTimeZoneCurrentUtcOffset(timeZone),
            guessLocal,
        });
    });
    const cbDeleteValue = useFunction(() => {
        setStorageTimeZone(appName, undefined);

        deleteAppSettings(appName, ECommonSettings.TimeZone);
    });

    return [value, cbChangeValue, cbDeleteValue];
}

function getSyncStorageKey(appName: TSettingsStoreName): string {
    return `SYNC_STORAGE_TIMEZONE_${appName}`;
}

function getStorageTimeZone(appName: TSettingsStoreName): undefined | TimeZone {
    return (localStorage.getItem(getSyncStorageKey(appName)) as TimeZone) ?? undefined;
}

function setStorageTimeZone(appName: TSettingsStoreName, timeZone: undefined | TimeZone) {
    const key = getSyncStorageKey(appName);

    if (isNil(timeZone)) {
        localStorage.removeItem(key);
    } else {
        localStorage.setItem(key, timeZone);
    }
}
