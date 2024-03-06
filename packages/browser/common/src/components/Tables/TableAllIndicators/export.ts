import { capitalize, isNil, lowerCase } from 'lodash-es';

import type { TIndicator } from '../../../modules/actions/indicators/defs';
import { EDateTimeFormats, TimeZone } from '../../../types/time';
import { toDayjsWithTimezone } from '../../../utils/time';

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
