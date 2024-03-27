import { isNil } from 'lodash-es';
import { EMPTY, interval } from 'rxjs';
import { mapTo, switchMap } from 'rxjs/operators';

import type { TSettingsStoreName } from '../actors/Settings/db';
import { ECommonSettings } from '../components/Settings/def';
import { TContextRef } from '../di';
import { ModuleSettings } from '../modules/settings';
import type { Minutes, TTimeZoneInfo } from '../types/time';
import { TimeZoneList } from '../types/time';
import {
    getCurrentUtcOffset,
    getTimeZoneCurrentUtcOffset,
    guessCurrentTimeZone,
    minutes2milliseconds,
} from '../utils/time';

const TIMEZONE_CHANGE_INTERVAL = minutes2milliseconds(15 as Minutes);

export function initSettingsEffects(ctx: TContextRef, appName: TSettingsStoreName) {
    initTimeZoneDstChangeWatch(ctx, appName);
}

function initTimeZoneDstChangeWatch(ctx: TContextRef, appName: TSettingsStoreName) {
    const { getAppSettings$, setAppSettings } = ModuleSettings(ctx);

    getAppSettings$<TTimeZoneInfo>(appName, ECommonSettings.TimeZone)
        .pipe(
            switchMap((timeZoneInfo) =>
                isNil(timeZoneInfo) || timeZoneInfo.timeZone === TimeZoneList.UTC
                    ? EMPTY
                    : interval(TIMEZONE_CHANGE_INTERVAL).pipe(mapTo(timeZoneInfo)),
            ),
        )
        .subscribe(({ timeZone, utcOffset, guessLocal }) => {
            if (guessLocal) {
                const currentUtcOffset = getCurrentUtcOffset();
                if (currentUtcOffset !== utcOffset) {
                    setAppSettings<TTimeZoneInfo>(appName, ECommonSettings.TimeZone, {
                        timeZone: guessCurrentTimeZone(),
                        utcOffset: currentUtcOffset,
                        guessLocal,
                    });
                }
            } else {
                const currentUtcOffset = getTimeZoneCurrentUtcOffset(timeZone);

                if (currentUtcOffset !== utcOffset) {
                    setAppSettings<TTimeZoneInfo>(appName, ECommonSettings.TimeZone, {
                        timeZone,
                        utcOffset: currentUtcOffset,
                        guessLocal,
                    });
                }
            }
        });
}
