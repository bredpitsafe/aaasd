import type { TimeZone } from '@common/types';
import { EDateTimeFormats } from '@common/types';
import { toDayjsWithTimezone } from '@common/utils';
import { capitalize, isNil, lowerCase } from 'lodash-es';

import type { TIndicator } from '../../../modules/actions/indicators/defs';

export async function getCSVOptions(timeZone: TimeZone) {
    const fields = [
        keyToField('publisher'),
        keyToField('name'),
        keyToField('value'),
        {
            label: 'Timestamp',
            value: (row: TIndicator) =>
                isNil(row.platformTime)
                    ? null
                    : toDayjsWithTimezone(row.platformTime, timeZone).format(
                          EDateTimeFormats.DateTimeMilliseconds,
                      ),
        },
    ];

    return { fields };

    function keyToField(key: string) {
        return {
            label: capitalize(lowerCase(key)),
            value: key,
        };
    }
}
