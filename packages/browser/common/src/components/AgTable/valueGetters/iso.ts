import type { ValueGetterParams } from 'ag-grid-community';
import { get, isEmpty, isNil } from 'lodash-es';

import type { Nil } from '../../../types';
import type { ISO } from '../../../types/time';
import { TColDef } from '../types';

type TGetter<RecordType extends object> = (
    data: Nil | RecordType,
    field: TColDef<RecordType>['field'],
) => unknown;

const defaultGetter = <RecordType extends object>(
    data: Nil | RecordType,
    field: TColDef<RecordType>['field'],
) => (!isNil(field) ? get(data, field) : undefined);

export function isoGetter<RecordType extends object>(isoGetter?: TGetter<RecordType>) {
    const valueGetter = isoGetter ?? defaultGetter;

    return function getter(params: ValueGetterParams<RecordType>) {
        const value = valueGetter(params.data, params.colDef.field);
        return isEmpty(value) ? null : (value as ISO);
    };
}
