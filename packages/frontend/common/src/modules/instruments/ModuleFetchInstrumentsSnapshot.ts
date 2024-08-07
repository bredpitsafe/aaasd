import type { WithMock } from '@backend/bff/src/def/mock.ts';
import type {
    TInstrument,
    TInstrumentApprovalStatus,
    TInstrumentSortOrderField,
} from '@backend/bff/src/modules/instruments/schemas/defs.ts';
import type {
    TFetchInstrumentsSnapshotRequestPayload,
    TFetchInstrumentsSnapshotResponsePayload,
} from '@backend/bff/src/modules/instruments/schemas/FetchInstrumentsSnapshot.schema.ts';
import { EPlatformSocketRemoteProcedureName, ERemoteProcedureType } from '@common/rpc';
import type { ISO } from '@common/types';
import { lowerCaseComparator } from '@common/utils/src/comporators/lowerCaseComparator.ts';
import { incNumericalComparator } from '@common/utils/src/comporators/numericalComparator.ts';
import { isEmpty } from 'lodash-es';

import { DEDUPE_REMOVE_DELAY, SHARE_RESET_DELAY } from '../../defs/observables.ts';
import type { TInstrumentKind } from '../../types/domain/instrument.ts';
import type { ESortOrder } from '../../types/domain/pagination.ts';
import type { TSocketStruct } from '../../types/domain/sockets.ts';
import { getSocketUrlHash } from '../../utils/hash/getSocketUrlHash.ts';
import { createRemoteProcedureCall } from '../../utils/RPC/createRemoteProcedureCall';
import { createRemoteProcedureDescriptor } from '../../utils/RPC/createRemoteProcedureDescriptor';
import { semanticHash } from '../../utils/semanticHash.ts';
import { getServerInstrumentSort } from './utils.ts';

const DEFAULT_SORTING: TInstrumentSortOrderField[] = [
    {
        field: 'INSTRUMENT_SORT_FIELD_NAME',
        sortOrder: 'SORT_ORDER_ASC',
    },
];

const fetchDescriptor = createRemoteProcedureDescriptor<
    TFetchInstrumentsSnapshotRequestPayload,
    TFetchInstrumentsSnapshotResponsePayload
>()(EPlatformSocketRemoteProcedureName.FetchInstrumentsSnapshot, ERemoteProcedureType.Request);

export const ModuleFetchInstrumentsSnapshot = createRemoteProcedureCall(fetchDescriptor)({
    getParams: (
        params: WithMock<{
            target: TSocketStruct;
            pagination: { limit: number; offset: number };
            filter?: {
                instrumentIds?: number[];
                approvalStatuses?: TInstrumentApprovalStatus[];
                nameRegex?: string;
                exchanges?: number[];
                kinds?: TInstrumentKind[];
                exchangeRegex?: string;
            };
            sort: {
                field: keyof TInstrument;
                sort: ESortOrder;
            }[];
            platformTime: ISO;
        }>,
    ) => ({
        type: EPlatformSocketRemoteProcedureName.FetchInstrumentsSnapshot,
        target: params.target,
        mock: params.mock,

        filters:
            isEmpty(params.filter?.instrumentIds) &&
            isEmpty(params.filter?.nameRegex) &&
            isEmpty(params.filter?.approvalStatuses) &&
            isEmpty(params.filter?.exchangeRegex)
                ? {}
                : {
                      include: {
                          instrumentIds: params.filter?.instrumentIds ?? [],
                          nameRegex: params.filter?.nameRegex,
                          names: [],
                          approvalStatuses: params.filter?.approvalStatuses ?? [],
                          exchanges: [],
                          kinds: [],
                          exchangeRegex: params.filter?.exchangeRegex,
                      },
                  },
        params: { includeProviders: true },
        snapshot: {
            sort: {
                fields: getServerInstrumentSort(params.sort) ?? DEFAULT_SORTING,
            },
            pagination: params.pagination,
            withTotal: true,
        },
        platformTime: params.platformTime,
    }),
    dedobs: {
        normalize: ([params]) =>
            semanticHash.get(params, {
                target: semanticHash.withHasher(getSocketUrlHash),
                filter: {
                    instrumentIds: semanticHash.withSorter(incNumericalComparator),
                    approvalStatuses: semanticHash.withSorter(lowerCaseComparator),
                    exchanges: semanticHash.withSorter(incNumericalComparator),
                    kinds: semanticHash.withSorter(incNumericalComparator),
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
