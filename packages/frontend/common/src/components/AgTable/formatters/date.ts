import type { TimeZone } from '@common/types';
import { EDateTimeFormats } from '@common/types';
import { toDayjsWithTimezone } from '@common/utils';
import type { ValueFormatterFunc } from '@frontend/ag-grid';
import { isNil } from 'lodash-es';

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
