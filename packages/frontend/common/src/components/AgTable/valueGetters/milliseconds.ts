import type { Nanoseconds } from '@common/types';
import { nanoseconds2milliseconds } from '@common/utils';
import type { ValueGetterParams } from '@frontend/ag-grid';
import { get, isNil } from 'lodash-es';

export function millisecondsGetter<RecordType>(params: ValueGetterParams<RecordType>) {
    const { field } = params.colDef;
    const value = !isNil(field) ? get(params.data, field) : undefined;
    if (isNil(value)) {
        return null;
    }

    return nanoseconds2milliseconds(value as unknown as Nanoseconds);
}
