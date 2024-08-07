import type { ISO, Nil, TimeZone } from '@common/types';
import { EDateTimeFormats } from '@common/types';
import type { ColDef } from '@frontend/ag-grid';
import { EColumnFilterType } from '@frontend/ag-grid/src/types';
import { isFunction } from 'lodash-es';

import { dateFormatter } from '../formatters/date';
import { isoGetter } from '../valueGetters/iso';

export function getTimeColumn<T extends object>(
    fieldOrGetter: ColDef<T>['field'] | ((data: Nil | T) => Nil | ISO),
    name: string,
    timeZone: TimeZone,
): ColDef<T> {
    const isGetter = isFunction(fieldOrGetter);
    const field = isGetter ? undefined : fieldOrGetter;
    const getter = isGetter ? fieldOrGetter : undefined;
    return {
        field,
        headerName: name,
        valueGetter: isoGetter(getter),
        valueFormatter: dateFormatter(timeZone, EDateTimeFormats.DateTime),
        filter: EColumnFilterType.date,
    };
}
