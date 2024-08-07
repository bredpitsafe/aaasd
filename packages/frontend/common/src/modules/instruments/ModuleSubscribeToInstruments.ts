import type { WithMock } from '@backend/bff/src/def/mock.ts';
import type {
    TInstrument,
    TInstrumentApprovalStatus,
    TInstrumentKind,
    TInstrumentSortOrderField,
} from '@backend/bff/src/modules/instruments/schemas/defs.ts';
import type {
    TSubscribeToInstrumentsRequestPayload,
    TSubscribeToInstrumentsResponsePayload,
} from '@backend/bff/src/modules/instruments/schemas/SubscribeToInstruments.schema';
import { EPlatformSocketRemoteProcedureName, ERemoteProcedureType } from '@common/rpc';
import type { Nil } from '@common/types';
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
import { getClientInstrumentSort, getServerInstrumentSort } from './utils.ts';

const DEFAULT_SORTING: TInstrumentSortOrderField[] = [
    {
        field: 'INSTRUMENT_SORT_FIELD_NAME',
        sortOrder: 'SORT_ORDER_ASC',
    },
];

type TInstrumentsFilter = {
    instrumentIds?: number[];
    approvalStatuses?: TInstrumentApprovalStatus[];
    nameRegex?: string;
    kinds?: TInstrumentKind[];
    exchangeRegex?: string;
};

export const subscriptionDescriptor = createRemoteProcedureDescriptor<
    TSubscribeToInstrumentsRequestPayload,
    TSubscribeToInstrumentsResponsePayload
>()(EPlatformSocketRemoteProcedureName.SubscribeToInstruments, ERemoteProcedureType.Subscribe);

export const ModuleSubscribeToInstruments = createRemoteProcedureCall(subscriptionDescriptor)({
    getParams: (
        params: WithMock<{
            target: TSocketStruct;
            pagination: { limit: number; offset: number };
            filter?: TInstrumentsFilter;
            sort: {
                field: keyof TInstrument;
                sort: ESortOrder;
            }[];
        }>,
    ) => ({
        type: 'SubscribeToInstruments',
        target: params.target,
        snapshot: {
            sort: {
                fields: getServerInstrumentSort(params.sort) ?? DEFAULT_SORTING,
                enumVariantOrderOverride: {
                    approvalStatus: [
                        'INSTRUMENT_APPROVAL_STATUS_APPROVED',
                        'INSTRUMENT_APPROVAL_STATUS_BLOCKED',
                        'INSTRUMENT_APPROVAL_STATUS_UNAPPROVED',
                        'INSTRUMENT_APPROVAL_STATUS_UNREDUCED',
                        'INSTRUMENT_APPROVAL_STATUS_UNREDUCED_AFTER_APPROVAL',
                    ],
                    kinds: [
                        'INSTRUMENT_KIND_FUTURES',
                        'INSTRUMENT_KIND_INSTANT_SPOT',
                        'INSTRUMENT_KIND_INSTRUMENT_SWAP',
                        'INSTRUMENT_KIND_OPTION',
                        'INSTRUMENT_KIND_PERP_FUTURES',
                        'INSTRUMENT_KIND_SPOT',
                    ],
                },
            },
            pagination: params.pagination,
            withTotal: true,
        },
        params: { includeProviders: true },
        filters:
            isEmpty(params.filter?.instrumentIds) &&
            isEmpty(params.filter?.nameRegex) &&
            isEmpty(params.filter?.approvalStatuses) &&
            isEmpty(params.filter?.kinds) &&
            isEmpty(params.filter?.exchangeRegex)
                ? {}
                : {
                      include: {
                          instrumentIds: params.filter?.instrumentIds ?? [],
                          nameRegex: params.filter?.nameRegex,
                          names: [],
                          approvalStatuses: params.filter?.approvalStatuses ?? [],
                          kinds: params.filter?.kinds ?? [],
                          exchanges: [],
                          exchangeRegex: params.filter?.exchangeRegex,
                      },
                  },
        mock: params.mock,
    }),
    getPipe: (
        originalParams,
        { traceId },
        params,
    ): OperatorFunction<
        TValueDescriptor2<TReceivedData<TSubscribeToInstrumentsResponsePayload>>,
        TValueDescriptor2<{ rows: TInstrument[]; total?: number }>
    > => {
        const cache = new UnifierWithCompositeHash<TInstrument>('id', {
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
                        cache.modify(payload.removed as TInstrument[]);
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
                    .map(getClientInstrumentSort)
                    .filter(
                        (
                            sortField,
                        ): sortField is Exclude<ReturnType<typeof getClientInstrumentSort>, Nil> =>
                            !isNil(sortField),
                    ),
            ) as [
                Exclude<ReturnType<typeof getClientInstrumentSort>, Nil>[0][],
                Exclude<ReturnType<typeof getClientInstrumentSort>, Nil>[1][],
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
                        message: `[ModuleSubscribeToInstruments] Requested page size ${params.snapshot.pagination.limit} with offset ${params.snapshot.pagination.offset}, got ${rows.length} should be ${calculatesPageSize}`,
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
                    ...semanticHash.withHasher<TInstrumentsFilter>((filter) =>
                        semanticHash.get(filter, {
                            instrumentIds: semanticHash.withSorter(incNumericalComparator),
                            approvalStatuses: semanticHash.withSorter(lowerCaseComparator),
                            kinds: semanticHash.withSorter(lowerCaseComparator),
                        }),
                    ),
                },
                sort: semanticHash.withSorter<{ field: keyof TInstrument; sort: ESortOrder }>(
                    (a, b) => a.field.localeCompare(b.field) || a.sort.localeCompare(b.sort),
                ),
                pagination: {},
            }),
        resetDelay: SHARE_RESET_DELAY,
        removeDelay: DEDUPE_REMOVE_DELAY,
    },
});
