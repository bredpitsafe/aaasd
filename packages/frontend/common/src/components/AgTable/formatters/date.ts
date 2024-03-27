import type { ValueFormatterFunc } from '@frontend/ag-grid';
import { isNil } from 'lodash-es';

import { EDateTimeFormats, TimeZone } from '../../../types/time';
import { toDayjsWithTimezone } from '../../../utils/time';
import { isGroupRow } from '../utils';

export function dateFormatter(
    timeZone: TimeZone,
    dateTimeFormat: EDateTimeFormats = EDateTimeFormats.DateTime,
): ValueFormatterFunc {
    return (params) => {
        if (isNil(params.node)) return '';
        if (isNil(params.value)) return isGroupRow(params.node) ? '' : '—';
        return toDayjsWithTimezone(params.value, timeZone).format(dateTimeFormat);
    };
}
