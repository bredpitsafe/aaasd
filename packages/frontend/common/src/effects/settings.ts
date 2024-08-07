import type { Minutes, TTimeZoneInfo } from '@common/types';
import { TimeZoneList } from '@common/types';
import {
    getCurrentUtcOffset,
    getTimeZoneCurrentUtcOffset,
    guessCurrentTimeZone,
    minutes2milliseconds,
} from '@common/utils';
import { isNil } from 'lodash-es';
import { EMPTY, firstValueFrom, interval } from 'rxjs';
import { mapTo, switchMap } from 'rxjs/operators';

import { ECommonSettings } from '../components/Settings/def';
import type { TContextRef } from '../di';
import { ModuleApplicationName } from '../modules/applicationName';
import { ModuleSettings } from '../modules/settings';
import { ModuleNotifyErrorAndFail } from '../utils/Rx/ModuleNotify';
import { extractSyncedValueFromValueDescriptor } from '../utils/Rx/ValueDescriptor2';

const TIMEZONE_CHANGE_INTERVAL = minutes2milliseconds(15 as Minutes);

export function initSettingsEffects(ctx: TContextRef) {
    initTimeZoneDstChangeWatch(ctx);
}

function initTimeZoneDstChangeWatch(ctx: TContextRef) {
    const { getAppSettings$, setAppSettings } = ModuleSettings(ctx);
    const { appName } = ModuleApplicationName(ctx);
    const notifyErrorAndFail = ModuleNotifyErrorAndFail(ctx);

    getAppSettings$(appName, ECommonSettings.TimeZone)
        .pipe(
            notifyErrorAndFail(),
            extractSyncedValueFromValueDescriptor(),
            switchMap((timeZoneInfo) =>
                isNil(timeZoneInfo) || (timeZoneInfo as TTimeZoneInfo).timeZone === TimeZoneList.UTC
                    ? EMPTY
                    : interval(TIMEZONE_CHANGE_INTERVAL).pipe(mapTo(timeZoneInfo as TTimeZoneInfo)),
            ),
        )
        .subscribe(({ timeZone, utcOffset, guessLocal }) => {
            if (guessLocal) {
                const currentUtcOffset = getCurrentUtcOffset();
                if (currentUtcOffset !== utcOffset) {
                    firstValueFrom(
                        setAppSettings({
                            appName,
                            key: ECommonSettings.TimeZone,
                            value: {
                                timeZone: guessCurrentTimeZone(),
                                utcOffset: currentUtcOffset,
                                guessLocal,
                            },
                        }),
                    );
                }
            } else {
                const currentUtcOffset = getTimeZoneCurrentUtcOffset(timeZone);

                if (currentUtcOffset !== utcOffset) {
                    firstValueFrom(
                        setAppSettings({
                            appName,
                            key: ECommonSettings.TimeZone,
                            value: {
                                timeZone,
                                utcOffset: currentUtcOffset,
                                guessLocal,
                            },
                        }),
                    );
                }
            }
        });
}
