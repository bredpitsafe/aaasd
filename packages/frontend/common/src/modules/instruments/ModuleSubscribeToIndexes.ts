import type { WithMock } from '@backend/bff/src/def/mock.ts';
import type {
    TIndex,
    TIndexApprovalStatus,
    TIndexSortField,
    TIndexSortOrderField,
} from '@backend/bff/src/modules/instruments/schemas/defs.ts';
import type {
    TSubscribeToIndexesRequestPayload,
    TSubscribeToIndexesResponsePayload,
} from '@backend/bff/src/modules/instruments/schemas/SubscribeToIndexes.schema.ts';
import { EPlatformSocketRemoteProcedureName, ERemoteProcedureType } from '@common/rpc';
import type { Nil } from '@common/types';
import { assertFail } from '@common/utils';
import { assertNever } from '@common/utils/src/assert.ts';
import { isDeepObjectEmpty } from '@common/utils/src/comporators/isDeepObjectEmpty.ts';
import { lowerCaseComparator } from '@common/utils/src/comporators/lowerCaseComparator.ts';
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
import { logger } from '../../utils/Tracing';
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

const DEFAULT_SORTING: TIndexSortOrderField[] = [
    {
        field: 'INDEX_SORT_FIELD_NAME',
        sortOrder: 'SORT_ORDER_ASC',
    },
];

type TIndexesFilter = {
    indexIds?: number[];
    nameRegex?: string;
    approvalStatuses?: TIndexApprovalStatus[];
};

export const subscriptionDescriptor = createRemoteProcedureDescriptor<
    TSubscribeToIndexesRequestPayload,
    TSubscribeToIndexesResponsePayload
>()(EPlatformSocketRemoteProcedureName.SubscribeToIndexes, ERemoteProcedureType.Subscribe);

export const ModuleSubscribeToIndexes = createRemoteProcedureCall(subscriptionDescriptor)({
    getParams: (
        params: WithMock<{
            target: TSocketStruct;
            pagination: { limit: number; offset: number };
            filter?: TIndexesFilter;
            sort: {
                field: keyof TIndex;
                sort: ESortOrder;
            }[];
        }>,
    ) => ({
        type: 'SubscribeToIndexes',
        target: params.target,
        snapshot: {
            sort: {
                fields: getServerSort(params.sort) ?? DEFAULT_SORTING,
                enumVariantOrderOverride: {
                    approvalStatus: [
                        'INDEX_APPROVAL_STATUS_APPROVED',
                        'INDEX_APPROVAL_STATUS_UNAPPROVED',
                    ],
                },
            },
            pagination: params.pagination,
            withTotal: true,
        },
        params: { includeProviders: true },
        filters:
            isEmpty(params.filter?.indexIds) &&
            isEmpty(params.filter?.nameRegex) &&
            isEmpty(params.filter?.approvalStatuses)
                ? {}
                : {
                      include: {
                          indexIds: params.filter?.indexIds ?? [],
                          nameRegex: params.filter?.nameRegex,
                          names: [],
                          approvalStatuses: params.filter?.approvalStatuses ?? [],
                      },
                  },
        mock: params.mock,
    }),
    getPipe: (
        originalParams,
        { traceId },
        params,
    ): OperatorFunction<
        TValueDescriptor2<TReceivedData<TSubscribeToIndexesResponsePayload>>,
        TValueDescriptor2<{ rows: TIndex[]; total?: number }>
    > => {
        // `id` is NOT unique for indexes, it may be 0 for all unapproved indexes.
        // The only unique identifier for an index is `name`.
        const cache = new UnifierWithCompositeHash<TIndex>('name', {
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
                        cache.modify(payload.removed as TIndex[]);
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

            if (
                !isNil(payload.total) &&
                !isNil(params.snapshot) &&
                !isNil(params.snapshot.pagination)
            ) {
                const calculatesPageSize = Math.min(
                    Math.max(0, payload.total - params.snapshot.pagination.offset),
                    params.snapshot.pagination.limit,
                );

                if (rows.length !== calculatesPageSize) {
                    logger.error({
                        message: `[ModuleSubscribeToIndexes] Requested page size ${params.snapshot.pagination.limit} with offset ${params.snapshot.pagination.offset}, got ${rows.length} should be ${calculatesPageSize}`,
                        traceId,
                    });
                }
            }

            return createSyncedValueDescriptor({ rows, total: payload.total });
        });
    },
    dedobs: {
        normalize: ([params]) =>
            semanticHash.get(params, {
                target: semanticHash.withHasher(getSocketUrlHash),
                filter: {
                    ...semanticHash.withNullable(isDeepObjectEmpty),
                    ...semanticHash.withHasher<TIndexesFilter>((filter) =>
                        semanticHash.get(filter, {
                            indexIds: semanticHash.withSorter(incNumericalComparator),
                            names: semanticHash.withSorter(lowerCaseComparator),
                            approvalStatuses: semanticHash.withSorter(lowerCaseComparator),
                        }),
                    ),
                },
                sort: semanticHash.withSorter<{ field: keyof TIndex; sort: ESortOrder }>(
                    (a, b) => a.field.localeCompare(b.field) || a.sort.localeCompare(b.sort),
                ),
                pagination: {},
            }),
        resetDelay: SHARE_RESET_DELAY,
        removeDelay: DEDUPE_REMOVE_DELAY,
    },
});

function getClientSort({
    field,
    sortOrder,
}: TIndexSortOrderField): [keyof TIndex, 'asc' | 'desc'] | undefined {
    if (
        field === 'INDEX_SORT_FIELD_UNSPECIFIED' ||
        sortOrder === 'SORT_ORDER_DIRECTION_UNSPECIFIED'
    ) {
        return undefined;
    }

    switch (field) {
        case 'INDEX_SORT_FIELD_NAME':
            return ['name', getClientSortOrder(sortOrder)];
        case 'INDEX_SORT_FIELD_PLATFORM_TIME':
            return ['platformTime', getClientSortOrder(sortOrder)];
        case 'INDEX_SORT_FIELD_APPROVAL_STATUS':
            return ['approvalStatus', getClientSortOrder(sortOrder)];
        default:
            assertNever(field);
    }
}

function getServerSort(
    sorting: {
        field: keyof TIndex;
        sort: ESortOrder;
    }[],
): TIndexSortOrderField[] | undefined {
    const serverSorting = sorting
        .map(({ field, sort }) => {
            switch (field) {
                case 'name':
                    return {
                        field: 'INDEX_SORT_FIELD_NAME',
                        sortOrder: getServerSortOrder(sort),
                    };

                case 'platformTime':
                    return {
                        field: 'INDEX_SORT_FIELD_PLATFORM_TIME',
                        sortOrder: getServerSortOrder(sort),
                    };

                case 'approvalStatus':
                    return {
                        field: 'INDEX_SORT_FIELD_APPROVAL_STATUS',
                        sortOrder: getServerSortOrder(sort),
                    };

                case 'id':
                case 'providerIndexes':
                    return assertFail(field);

                default:
                    assertNever(field);
            }
        })
        .filter(
            (
                sorting,
            ): sorting is {
                field: TIndexSortField;
                sortOrder: 'SORT_ORDER_ASC' | 'SORT_ORDER_DESC';
            } => !isNil(sorting),
        );

    return isEmpty(serverSorting) ? undefined : serverSorting;
}
