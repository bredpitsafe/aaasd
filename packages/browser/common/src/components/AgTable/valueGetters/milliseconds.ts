import { ValueGetterParams } from 'ag-grid-community';
import { get, isNil } from 'lodash-es';

import { Nanoseconds } from '../../../types/time';
import { nanoseconds2milliseconds } from '../../../utils/time';

export function millisecondsGetter<RecordType>(params: ValueGetterParams<RecordType>) {
    const { field } = params.colDef;
    const value = !isNil(field) ? get(params.data, field) : undefined;
    if (isNil(value)) {
        return null;
    }

    return nanoseconds2milliseconds(value as unknown as Nanoseconds);
}
