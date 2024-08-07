import type { WithMock } from '@backend/bff/src/def/mock.ts';
import type {
    TInstrument,
    TInstrumentApprovalStatus,
    TInstrumentKind,
} from '@backend/bff/src/modules/instruments/schemas/defs.ts';
import type {
    TSubscribeToInstrumentRevisionsRequestPayload,
    TSubscribeToInstrumentRevisionsResponsePayload,
} from '@backend/bff/src/modules/instruments/schemas/SubscribeToInstrumentRevisions.schema.ts';
import { EPlatformSocketRemoteProcedureName, ERemoteProcedureType } from '@common/rpc';
import { isDeepObjectEmpty } from '@common/utils/src/comporators/isDeepObjectEmpty.ts';
import { lowerCaseComparator } from '@common/utils/src/comporators/lowerCaseComparator.ts';
import { incNumericalComparator } from '@common/utils/src/comporators/numericalComparator.ts';
import { isEmpty } from 'lodash-es';

import { DEDUPE_REMOVE_DELAY, SHARE_RESET_DELAY } from '../../defs/observables.ts';
import type { ESortOrder } from '../../types/domain/pagination.ts';
import type { TSocketStruct } from '../../types/domain/sockets.ts';
import { getSocketUrlHash } from '../../utils/hash/getSocketUrlHash.ts';
import { createRemoteProcedureCall } from '../../utils/RPC/createRemoteProcedureCall';
import { createRemoteProcedureDescriptor } from '../../utils/RPC/createRemoteProcedureDescriptor';
import { semanticHash } from '../../utils/semanticHash.ts';

type TInstrumentsRevisionsFilter = {
    instrumentIds?: number[];
    names?: string[];
    nameRegex?: string;
    approvalStatuses?: TInstrumentApprovalStatus[];
    exchanges?: string[];
    kinds?: TInstrumentKind[];
};

const subscribeDescriptor = createRemoteProcedureDescriptor<
    TSubscribeToInstrumentRevisionsRequestPayload,
    TSubscribeToInstrumentRevisionsResponsePayload
>()(
    EPlatformSocketRemoteProcedureName.SubscribeToInstrumentRevisions,
    ERemoteProcedureType.Subscribe,
);

export const ModuleSubscribeToInstrumentRevisions = createRemoteProcedureCall(subscribeDescriptor)({
    getParams: (
        params: WithMock<{
            target: TSocketStruct;
            filter: TInstrumentsRevisionsFilter;
        }>,
    ) => ({
        type: EPlatformSocketRemoteProcedureName.SubscribeToInstrumentRevisions,
        target: params.target,
        filters:
            isEmpty(params.filter?.instrumentIds) &&
            isEmpty(params.filter?.names) &&
            isEmpty(params.filter?.nameRegex) &&
            isEmpty(params.filter?.approvalStatuses)
                ? undefined
                : {
                      include: {
                          instrumentIds: params.filter?.instrumentIds ?? [],
                          names: params.filter?.names ?? [],
                          approvalStatuses: params.filter?.approvalStatuses ?? [],
                          nameRegex: params.filter?.nameRegex,
                          exchanges: params.filter?.exchanges ?? [],
                          kinds: params.filter?.kinds ?? [],
                      },
                  },
        mock: params.mock,
    }),
    dedobs: {
        normalize: ([params]) =>
            semanticHash.get(params, {
                target: semanticHash.withHasher(getSocketUrlHash),
                filter: {
                    ...semanticHash.withNullable(isDeepObjectEmpty),
                    ...semanticHash.withHasher<TInstrumentsRevisionsFilter>((filter) =>
                        semanticHash.get(filter, {
                            instrumentIds: semanticHash.withSorter(incNumericalComparator),
                            names: semanticHash.withSorter(lowerCaseComparator),
                            approvalStatuses: semanticHash.withSorter(lowerCaseComparator),
                            exchanges: semanticHash.withSorter(lowerCaseComparator),
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
