import { ColDef } from 'ag-grid-community';
import { isFunction } from 'lodash-es';

import type { Nil } from '../../../types';
import { EDateTimeFormats, ISO, TimeZone } from '../../../types/time';
import { dateFormatter } from '../formatters/date';
import type { TColDef } from '../types';
import { EColumnFilterType } from '../types';
import { isoGetter } from '../valueGetters/iso';

export function getTimeColumn<T extends object>(
    fieldOrGetter: ColDef<T>['field'] | ((data: Nil | T) => Nil | ISO),
    name: string,
    timeZone: TimeZone,
): TColDef<T> {
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
