import type { WithMock } from '@backend/bff/src/def/mock.ts';
import type {
    TInstrumentDynamicData,
    TInstrumentDynamicDataSortOrderField,
    TInstrumentDynamicDataSortOrderFieldInstrumentDynamicDataSortField,
} from '@backend/bff/src/modules/instruments/schemas/defs.ts';
import type {
    TSubscribeToInstrumentsDynamicDataRequestPayload,
    TSubscribeToInstrumentsDynamicDataResponsePayload,
} from '@backend/bff/src/modules/instruments/schemas/SubscribeToInstrumentsDynamicData.schema.ts';
import { EPlatformSocketRemoteProcedureName, ERemoteProcedureType } from '@common/rpc';
import type { Nil } from '@common/types';
import { assertFail } from '@common/utils';
import { assertNever } from '@common/utils/src/assert.ts';
import { isDeepObjectEmpty } from '@common/utils/src/comporators/isDeepObjectEmpty.ts';
import { incNumericalComparator } from '@common/utils/src/comporators/numericalComparator.ts';
import { isEmpty, isNil, orderBy, unzip } from 'lodash-es';
import type { OperatorFunction } from 'rxjs';

import { DEDUPE_REMOVE_DELAY, SHARE_RESET_DELAY } from '../../defs/observables.ts';
import type { TReceivedData } from '../../lib/BFFSocket/def';
import type { ESortOrder } from '../../types/domain/pagination.ts';
import type { TSocketStruct } from '../../types/domain/sockets.ts';
import { getSocketUrlHash } from '../../utils/hash/getSocketUrlHash.ts';
import { createRemoteProcedureCall } from '../../utils/RPC/createRemoteProcedureCall';
import { createRemoteProcedureDescriptor } from '../../utils/RPC/createRemoteProcedureDescriptor';
import { mapValueDescriptor } from '../../utils/Rx/ValueDescriptor2';
import { semanticHash } from '../../utils/semanticHash.ts';
import {
    getCachedArrayFromUnifier,
    UnifierWithCompositeHash,
} from '../../utils/unifierWithCompositeHash';
import type { TValueDescriptor2 } from '../../utils/ValueDescriptor/types';
import {
    createSyncedValueDescriptor,
    isSyncedValueDescriptor,
    WAITING_VD,
} from '../../utils/ValueDescriptor/utils';
import { getClientSortOrder, getServerSortOrder } from '../utils.ts';

const DEFAULT_SORTING: TInstrumentDynamicDataSortOrderField[] = [
    {
        field: 'INSTRUMENT_DYNAMIC_DATA_SORT_FIELD_NAME',
        sortOrder: 'SORT_ORDER_ASC',
    },
];

export const subscriptionDescriptor = createRemoteProcedureDescriptor<
    TSubscribeToInstrumentsDynamicDataRequestPayload,
    TSubscribeToInstrumentsDynamicDataResponsePayload
>()(
    EPlatformSocketRemoteProcedureName.SubscribeToInstrumentsDynamicData,
    ERemoteProcedureType.Subscribe,
);

type TInstrumentsDynamicDataFilter = {
    instrumentIds?: number[];
    nameRegex?: string;
};

export const ModuleSubscribeToInstrumentsDynamicData = createRemoteProcedureCall(
    subscriptionDescriptor,
)({
    getParams: (
        params: WithMock<{
            target: TSocketStruct;
            pagination: { limit: number; offset: number };
            filters?: TInstrumentsDynamicDataFilter;
            sort: {
                field: keyof TInstrumentDynamicData;
                sort: ESortOrder;
            }[];
        }>,
    ) => ({
        type: 'SubscribeToInstrumentsDynamicData',
        target: params.target,
        snapshot: {
            sort: {
                fields: getServerSort(params.sort) ?? DEFAULT_SORTING,
            },
            pagination: params.pagination,
            withTotal: true,
        },
        params: {},
        filters:
            isEmpty(params.filters?.instrumentIds) && isEmpty(params.filters?.nameRegex)
                ? {}
                : {
                      include: {
                          instrumentIds: params.filters?.instrumentIds ?? [],
                          nameRegex: params.filters?.nameRegex,
                          names: [],
                      },
                  },
        mock: params.mock,
    }),
    getPipe: (
        originalParams,
        options,
        params,
    ): OperatorFunction<
        TValueDescriptor2<TReceivedData<TSubscribeToInstrumentsDynamicDataResponsePayload>>,
        TValueDescriptor2<{ rows: TInstrumentDynamicData[]; total?: number }>
    > => {
        const cache = new UnifierWithCompositeHash<TInstrumentDynamicData>('id', {
            removePredicate: (item) => isNil(item.platformTime),
        });

        return mapValueDescriptor((desc) => {
            if (!isSyncedValueDescriptor(desc)) {
                return desc;
            }

            const { payload } = desc.value;
            const { type } = payload;

            if (type === 'Ok') {
                cache.clear();
                return WAITING_VD;
            }

            switch (type) {
                case 'Snapshot':
                    if (!isNil(payload.snapshot)) {
                        cache.modify(payload.snapshot);
                    }
                    break;
                case 'Updates':
                    if (!isNil(payload.removed) && payload.removed.length > 0) {
                        cache.modify(payload.removed as TInstrumentDynamicData[]);
                    }

                    if (!isNil(payload.upserted) && payload.upserted.length > 0) {
                        cache.modify(payload.upserted);
                    }

                    break;
                default:
                    assertNever(type);
            }

            const sorting = unzip(
                (params.snapshot?.sort?.fields ?? DEFAULT_SORTING)
                    .map(getClientSort)
                    .filter(
                        (sortField): sortField is Exclude<ReturnType<typeof getClientSort>, Nil> =>
                            !isNil(sortField),
                    ),
            ) as [
                Exclude<ReturnType<typeof getClientSort>, Nil>[0][],
                Exclude<ReturnType<typeof getClientSort>, Nil>[1][],
            ];

            const rawRows = getCachedArrayFromUnifier(cache);
            const rows = isEmpty(sorting) ? rawRows : orderBy(rawRows, sorting[0], sorting[1]);

            return createSyncedValueDescriptor({ rows, total: Number(payload.total) });
        });
    },
    dedobs: {
        normalize: ([params]) =>
            semanticHash.get(params, {
                target: semanticHash.withHasher(getSocketUrlHash),
                filters: {
                    ...semanticHash.withNullable(isDeepObjectEmpty),
                    ...semanticHash.withHasher<TInstrumentsDynamicDataFilter>((filters) =>
                        semanticHash.get(filters, {
                            instrumentIds: semanticHash.withSorter(incNumericalComparator),
                        }),
                    ),
                },
                sort: semanticHash.withSorter<{
                    field: keyof TInstrumentDynamicData;
                    sort: ESortOrder;
                }>((a, b) => a.field.localeCompare(b.field) || a.sort.localeCompare(b.sort)),
                pagination: {},
            }),
        resetDelay: SHARE_RESET_DELAY,
        removeDelay: DEDUPE_REMOVE_DELAY,
    },
});

function getClientSort({
    field,
    sortOrder,
}: TInstrumentDynamicDataSortOrderField):
    | [keyof TInstrumentDynamicData, 'asc' | 'desc']
    | undefined {
    if (
        field === 'INSTRUMENT_DYNAMIC_DATA_SORT_FIELD_UNSPECIFIED' ||
        sortOrder === 'SORT_ORDER_DIRECTION_UNSPECIFIED'
    ) {
        return undefined;
    }

    switch (field) {
        case 'INSTRUMENT_DYNAMIC_DATA_SORT_FIELD_NAME':
            return ['name', getClientSortOrder(sortOrder)];
        case 'INSTRUMENT_DYNAMIC_DATA_SORT_FIELD_PLATFORM_TIME':
            return ['platformTime', getClientSortOrder(sortOrder)];
        case 'INSTRUMENT_DYNAMIC_DATA_SORT_FIELD_STATUS':
            return ['status', getClientSortOrder(sortOrder)];
        default:
            assertNever(field);
    }
}

function getServerSort(
    sorting: {
        field: keyof TInstrumentDynamicData;
        sort: ESortOrder;
    }[],
): TInstrumentDynamicDataSortOrderField[] | undefined {
    const serverSorting = sorting
        .map(({ field, sort }) => {
            switch (field) {
                case 'name':
                    return {
                        field: 'INSTRUMENT_DYNAMIC_DATA_SORT_FIELD_NAME',
                        sortOrder: getServerSortOrder(sort),
                    };

                case 'platformTime':
                    return {
                        field: 'INSTRUMENT_DYNAMIC_DATA_SORT_FIELD_PLATFORM_TIME',
                        sortOrder: getServerSortOrder(sort),
                    };

                case 'status':
                    return {
                        field: 'INSTRUMENT_DYNAMIC_DATA_SORT_FIELD_STATUS',
                        sortOrder: getServerSortOrder(sort),
                    };

                case 'id':
                case 'amountStepRules':
                case 'exchange':
                case 'maxPrice':
                case 'maxQty':
                case 'minPrice':
                case 'minQty':
                case 'minVolume':
                case 'priceStepRules':
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
                    TInstrumentDynamicDataSortOrderFieldInstrumentDynamicDataSortField,
                    'INSTRUMENT_DYNAMIC_DATA_SORT_FIELD_UNSPECIFIED'
                >;
                sortOrder: 'SORT_ORDER_ASC' | 'SORT_ORDER_DESC';
            } => !isNil(sorting),
        );

    return isEmpty(serverSorting) ? undefined : serverSorting;
}
