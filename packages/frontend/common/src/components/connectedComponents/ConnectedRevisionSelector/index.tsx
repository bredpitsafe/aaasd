import type { ISO, Nil } from '@common/types';
import { EDateTimeFormats } from '@common/types';
import { toDayjsWithTimezone } from '@common/utils';
import { assert } from '@common/utils/src/assert.ts';
import { isNil, isUndefined } from 'lodash-es';
import { useMemo } from 'react';

import {
    EStateTabSelectors,
    StateTabProps,
} from '../../../../e2e/selectors/trading-servers-manager/components/state-tab/state.tab.selectors';
import type { TComponentStateRevision } from '../../../types/domain/ComponentStateRevision';
import { useFunction } from '../../../utils/React/useFunction';
import { Select } from '../../Select';
import { useTimeZoneInfoSettings } from '../../Settings/hooks/useTimeZoneSettings';
import { cnRevisionSelector } from './styles.css';

type TProps = {
    options: TComponentStateRevision[];
    current: Nil | TComponentStateRevision;
    disabled?: boolean;
    onChange?: (r: TComponentStateRevision) => void;
};

export function ConnectedRevisionSelector({ options, current, disabled, onChange }: TProps) {
    const [{ timeZone }] = useTimeZoneInfoSettings();

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
            {...StateTabProps[EStateTabSelectors.RevisionsSelector]}
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
