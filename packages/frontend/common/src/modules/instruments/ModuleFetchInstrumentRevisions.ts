import type { WithMock } from '@backend/bff/src/def/mock.ts';
import type { TLogPaginationTimeDirection } from '@backend/bff/src/modules/defs.ts';
import type {
    TFetchInstrumentRevisionsLogRequestPayload,
    TFetchInstrumentRevisionsLogResponsePayload,
} from '@backend/bff/src/modules/instruments/schemas/FetchInstrumentRevisionsLog.schema.ts';
import { EPlatformSocketRemoteProcedureName, ERemoteProcedureType } from '@common/rpc';
import type { ISO } from '@common/types';

import type { TSocketStruct } from '../../types/domain/sockets.ts';
import { createRemoteProcedureCall } from '../../utils/RPC/createRemoteProcedureCall';
import { createRemoteProcedureDescriptor } from '../../utils/RPC/createRemoteProcedureDescriptor';

const fetchDescriptor = createRemoteProcedureDescriptor<
    TFetchInstrumentRevisionsLogRequestPayload,
    TFetchInstrumentRevisionsLogResponsePayload
>()(EPlatformSocketRemoteProcedureName.FetchInstrumentRevisionsLog, ERemoteProcedureType.Request);

export const ModuleFetchInstrumentRevisions = createRemoteProcedureCall(fetchDescriptor)({
    getParams: (
        params: WithMock<{
            target: TSocketStruct;
            filter: { instrumentId: number };
            pagination: {
                platformTime: ISO;
                direction?: TLogPaginationTimeDirection;
                softLimit: number;
                platformTimeBound?: string;
                platformTimeExcluded?: boolean;
                platformTimeBoundExcluded?: boolean;
            };
        }>,
    ) => ({
        type: EPlatformSocketRemoteProcedureName.FetchInstrumentRevisionsLog,
        target: params.target,
        pagination: {
            platformTime: params.pagination.platformTime,
            direction: params.pagination.direction ?? 'TIME_DIRECTION_BACKWARD',
            softLimit: params.pagination.softLimit,
            platformTimeBound: params.pagination.platformTimeBound,
            platformTimeExcluded: params.pagination.platformTimeExcluded ?? false,
            platformTimeBoundExcluded: params.pagination.platformTimeBoundExcluded ?? false,
        },
        filters: {
            include: { instrumentId: params.filter.instrumentId, statuses: [] },
        },
        mock: params.mock,
    }),
});
