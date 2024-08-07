import type { TBase64 } from '@common/utils/src/base64';
import { base64ToObject } from '@common/utils/src/base64';
import type {
    ETableIds,
    TFilterTableValue,
} from '@frontend/common/src/modules/clientTableFilters/data';
import type { TEncodedTypicalRouteParams } from '@frontend/common/src/modules/router/defs';
import { isNil } from 'lodash-es';

const decodeTableFilter = (filter: TEncodedTypicalRouteParams['filter']) => {
    if (isNil(filter)) {
        return null;
    }

    return base64ToObject(filter as TBase64<Partial<Record<ETableIds, TFilterTableValue>>>);
};

export const extractTableFilter = (id: ETableIds, filter: TEncodedTypicalRouteParams['filter']) => {
    const decodedFilter = decodeTableFilter(filter);

    if (isNil(decodedFilter)) return null;

    return decodedFilter[id] ?? null;
};
