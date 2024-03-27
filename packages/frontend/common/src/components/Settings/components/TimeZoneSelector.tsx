import { ClockCircleOutlined } from '@ant-design/icons';
import { isEqual } from 'lodash-es';
import { memo, useEffect, useMemo } from 'react';
import { interval } from 'rxjs';
import { distinctUntilChanged, mapTo } from 'rxjs/operators';

import type { TSettingsStoreName } from '../../../actors/Settings/db';
import { TimeZone, TimeZoneList, TTimeZoneInfo } from '../../../types/time';
import { useFunction } from '../../../utils/React/useFunction';
import { useSyncObservable } from '../../../utils/React/useSyncObservable';
import {
    getGuessedTimeZoneInfo,
    getTimeZoneCurrentUtcOffset,
    getTimeZoneFullName,
    getUtcTimeZoneInfo,
} from '../../../utils/time';
import { Option } from '../../Select';
import { useTimeZoneInfoSettings } from '../hooks/useTimeZoneSettings';
import { SettingsSelector } from '../Selector';
import { cnTimeZoneName, cnTimeZoneSelector } from './view.css';

const DEFAULT_TIMEZONES = [TimeZoneList.UTC, TimeZoneList.EuropeMoscow];

type TTimeZoneNameProps = TTimeZoneInfo & { sameAsLocal: boolean };

type TTimeZoneSelectorProps = {
    extendTimeZoneList: boolean;
    appName: TSettingsStoreName;
};

export const TimeZoneSelector = memo(
    ({ appName, extendTimeZoneList = true }: TTimeZoneSelectorProps) => {
        const [timeZoneInfo, changeTimeZone] = useTimeZoneInfoSettings(appName);

        const guessedUserTimeZoneInfo = useSyncObservable<TTimeZoneInfo>(
            useMemo(
                () =>
                    interval(30_000).pipe(
                        mapTo<TTimeZoneInfo>(getGuessedTimeZoneInfo()),
                        distinctUntilChanged(isEqual),
                    ),
                [],
            ),
            getGuessedTimeZoneInfo(),
        );

        const timeZoneList = useMemo(
            () => getTimeZoneList(guessedUserTimeZoneInfo, timeZoneInfo, extendTimeZoneList),
            [guessedUserTimeZoneInfo, timeZoneInfo, extendTimeZoneList],
        );

        useEffect(() => {
            if (timeZoneList.selectedTimeZoneInfo.timeZone !== timeZoneInfo.timeZone) {
                changeTimeZone(
                    timeZoneList.selectedTimeZoneInfo.timeZone,
                    timeZoneList.selectedTimeZoneInfo.guessLocal,
                );
            }
        }, [timeZoneList.selectedTimeZoneInfo, timeZoneInfo, changeTimeZone]);

        const cbSelectTimeZone = useFunction((timeZone: TimeZone) =>
            changeTimeZone(
                timeZone,
                timeZoneList.list.find(({ timeZone: itemTimeZone }) => itemTimeZone === timeZone)
                    ?.guessLocal ?? false,
            ),
        );

        return (
            <SettingsSelector
                className={cnTimeZoneSelector}
                labelSpan={4}
                label="Time Zone"
                value={timeZoneList.selectedTimeZoneInfo.timeZone}
                onSelect={cbSelectTimeZone}
            >
                {timeZoneList.list.map((timeZoneItem) => (
                    <Option key={timeZoneItem.timeZone} value={timeZoneItem.timeZone}>
                        <TimeZoneName {...timeZoneItem} />
                    </Option>
                ))}
            </SettingsSelector>
        );
    },
);

const TimeZoneName = memo((props: TTimeZoneNameProps) => {
    const timeZoneName = useMemo(() => getTimeZoneFullName(props), [props]);

    return (
        <div className={cnTimeZoneName}>
            <span>{timeZoneName}</span>
            {props.sameAsLocal && <ClockCircleOutlined />}
        </div>
    );
});

function getTimeZoneList(
    guessedUserTimeZoneInfo: TTimeZoneInfo,
    timeZoneInfo: TTimeZoneInfo,
    extendTimeZoneList: boolean,
): { list: TTimeZoneNameProps[]; selectedTimeZoneInfo: TTimeZoneInfo } {
    const timeZonesInfo = DEFAULT_TIMEZONES.map(
        (timeZone): TTimeZoneInfo => ({
            timeZone,
            utcOffset: getTimeZoneCurrentUtcOffset(timeZone),
            guessLocal: false,
        }),
    );

    if (extendTimeZoneList) {
        const hasSelectedTimeZoneInfo = timeZonesInfo.find(
            ({ timeZone }) => timeZone === timeZoneInfo.timeZone,
        );
        if (!hasSelectedTimeZoneInfo) {
            timeZonesInfo.unshift(timeZoneInfo);
        }

        const userTimeZoneInfo = timeZonesInfo.find(
            ({ timeZone }) => timeZone === guessedUserTimeZoneInfo.timeZone,
        );
        if (!userTimeZoneInfo) {
            timeZonesInfo.unshift(guessedUserTimeZoneInfo);
        }
    }

    const list = timeZonesInfo.map(
        (timeZoneInfo): TTimeZoneNameProps => ({
            ...timeZoneInfo,
            sameAsLocal: timeZoneInfo.utcOffset === guessedUserTimeZoneInfo.utcOffset,
        }),
    );
    const selectedTimeZoneInfo =
        timeZonesInfo.find(({ timeZone }) => timeZone === timeZoneInfo.timeZone) ??
        getUtcTimeZoneInfo();

    return { list, selectedTimeZoneInfo };
}
