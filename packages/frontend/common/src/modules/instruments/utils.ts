import type {
    TInstrument,
    TInstrumentSortOrderField,
} from '@backend/bff/src/modules/instruments/schemas/defs.ts';
import { assertFail } from '@common/utils';
import { assertNever } from '@common/utils/src/assert.ts';
import { isEmpty, isNil } from 'lodash-es';

import type { ESortOrder } from '../../types/domain/pagination.ts';
import { getClientSortOrder, getServerSortOrder } from '../utils.ts';

export function getServerInstrumentSort(
    sorting: {
        field: keyof TInstrument;
        sort: ESortOrder;
    }[],
): TInstrumentSortOrderField[] | undefined {
    const serverSorting = sorting
        .map(({ field, sort }) => {
            switch (field) {
                case 'id':
                    return {
                        field: 'INSTRUMENT_SORT_FIELD_ID',
                        sortOrder: getServerSortOrder(sort),
                    };
                case 'kind':
                    return {
                        field: 'INSTRUMENT_SORT_FIELD_KIND',
                        sortOrder: getServerSortOrder(sort),
                    };
                case 'exchange':
                    return {
                        field: 'INSTRUMENT_SORT_FIELD_EXCHANGE',
                        sortOrder: getServerSortOrder(sort),
                    };

                case 'name':
                    return {
                        field: 'INSTRUMENT_SORT_FIELD_NAME',
                        sortOrder: getServerSortOrder(sort),
                    };

                case 'platformTime':
                    return {
                        field: 'INSTRUMENT_SORT_FIELD_PLATFORM_TIME',
                        sortOrder: getServerSortOrder(sort),
                    };

                case 'approvalStatus':
                    return {
                        field: 'INSTRUMENT_SORT_FIELD_APPROVAL_STATUS',
                        sortOrder: getServerSortOrder(sort),
                    };

                case 'amountNotation':
                case 'priceNotation':
                case 'user':
                case 'providerInstruments':
                case 'instrumentReductionErrors':
                    return assertFail(field);

                default:
                    assertNever(field);
            }
        })
        .filter(
            (
                sorting,
            ): sorting is {
                field: Exclude<
                    TInstrumentSortOrderField['field'],
                    'INSTRUMENT_SORT_FIELD_UNSPECIFIED'
                >;
                sortOrder: 'SORT_ORDER_ASC' | 'SORT_ORDER_DESC';
            } => !isNil(sorting),
        );

    return isEmpty(serverSorting) ? undefined : serverSorting;
}

export function getClientInstrumentSort({
    field,
    sortOrder,
}: TInstrumentSortOrderField): [keyof TInstrument, 'asc' | 'desc'] | undefined {
    if (
        field === 'INSTRUMENT_SORT_FIELD_UNSPECIFIED' ||
        sortOrder === 'SORT_ORDER_DIRECTION_UNSPECIFIED'
    ) {
        return undefined;
    }

    switch (field) {
        case 'INSTRUMENT_SORT_FIELD_ID':
            return ['id', getClientSortOrder(sortOrder)];
        case 'INSTRUMENT_SORT_FIELD_KIND':
            return ['kind', getClientSortOrder(sortOrder)];
        case 'INSTRUMENT_SORT_FIELD_EXCHANGE':
            return ['exchange', getClientSortOrder(sortOrder)];
        case 'INSTRUMENT_SORT_FIELD_NAME':
            return ['name', getClientSortOrder(sortOrder)];
        case 'INSTRUMENT_SORT_FIELD_PLATFORM_TIME':
            return ['platformTime', getClientSortOrder(sortOrder)];
        case 'INSTRUMENT_SORT_FIELD_APPROVAL_STATUS':
            return ['approvalStatus', getClientSortOrder(sortOrder)];
        default:
            assertNever(field);
    }
}
