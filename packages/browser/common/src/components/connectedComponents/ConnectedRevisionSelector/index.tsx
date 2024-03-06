import { isNil, isUndefined } from 'lodash-es';
import { useMemo } from 'react';

import { EApplicationName } from '../../../types/app';
import { TComponentStateRevision } from '../../../types/domain/ComponentStateRevision';
import { EDateTimeFormats, ISO } from '../../../types/time';
import { assert } from '../../../utils/assert';
import { useFunction } from '../../../utils/React/useFunction';
import { toDayjsWithTimezone } from '../../../utils/time';
import { Select } from '../../Select';
import { useTimeZoneInfoSettings } from '../../Settings/hooks/useTimeZoneSettings';
import { cnRevisionSelector } from './styles.css';

type TProps = {
    options: TComponentStateRevision[];
    current: TComponentStateRevision | undefined | null;
    disabled?: boolean;
    onChange?: (r: TComponentStateRevision) => void;
};

export function ConnectedRevisionSelector({ options, current, disabled, onChange }: TProps) {
    const [{ timeZone }] = useTimeZoneInfoSettings(EApplicationName.TradingServersManager);

    const isActualCurrent = useMemo(
        () =>
            isNil(current) ? true : options.some((r) => r.platformTime === current.platformTime),
        [current, options],
    );
    const placeholder = useMemo(
        () =>
            isNil(current)
                ? 'Select another revision'
                : toDayjsWithTimezone(current.platformTime, timeZone).format(
                      EDateTimeFormats.DateTime,
                  ),
        [current, timeZone],
    );
    const selectOptions = useMemo(
        () =>
            options.map((rev) => ({
                label: `${toDayjsWithTimezone(rev.platformTime, timeZone).format(
                    EDateTimeFormats.DateTime,
                )}`,
                value: rev.platformTime,
            })),
        [options, timeZone],
    );

    const setCurrentRev = useFunction((revTime: ISO) => {
        const rev = options.find((r) => r.platformTime === revTime);
        assert(
            !isUndefined(rev),
            '[ConnectedRevisionSelector]: revTime is not found among options',
        );
        onChange?.(rev);
    });

    return (
        <Select
            className={cnRevisionSelector}
            options={selectOptions}
            showSearch
            optionFilterProp="label"
            placeholder={placeholder}
            value={isActualCurrent ? current?.platformTime : undefined}
            onChange={setCurrentRev}
            disabled={disabled}
        />
    );
}
