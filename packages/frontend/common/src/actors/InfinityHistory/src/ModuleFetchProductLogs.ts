import type { Nanoseconds } from '@common/types';

import type {
    TFetchHistoryParams,
    TServerFetchHistoryParams,
} from '../../../modules/actions/def.ts';
import type {
    TProductLog,
    TProductLogFilters,
    TServerProductLogFilters,
} from '../../../modules/actions/productLogs/defs.ts';
import { tryFixFingerprints } from '../../../modules/actions/productLogs/utils.ts';
import type { TWithSocketTarget } from '../../../types/domain/sockets.ts';
import { createRemoteProcedureCall } from '../../../utils/RPC/createRemoteProcedureCall.ts';
import { createRemoteProcedureDescriptor } from '../../../utils/RPC/createRemoteProcedureDescriptor.ts';
import {
    EPlatformSocketRemoteProcedureName,
    ERemoteProcedureType,
} from '../../../utils/RPC/defs.ts';
import { mapValueDescriptor } from '../../../utils/Rx/ValueDescriptor2.ts';
import { createSyncedValueDescriptor } from '../../../utils/ValueDescriptor/utils.ts';

type TSendBody = {
    params: TServerFetchHistoryParams;
    filters: TServerProductLogFilters;
};

type TReceiveBody = {
    productLog: TProductLog[];
    checkedIntervalStart: Nanoseconds;
    checkedIntervalEnd: Nanoseconds;
};

const descriptor = createRemoteProcedureDescriptor<TSendBody, TReceiveBody>()(
    EPlatformSocketRemoteProcedureName.FetchProductLog,
    ERemoteProcedureType.Request,
);

export type TFetchProductLogsProps = TWithSocketTarget & {
    params: TFetchHistoryParams;
    filters: TProductLogFilters;
};

export const ModuleFetchProductLogs = createRemoteProcedureCall(descriptor)({
    getParams: (props: TFetchProductLogsProps) => {
        return {
            target: props.target,
            params: {
                limit: undefined,
                softLimit: props.params.limit,
                direction: props.params.direction,
                platformTime: props.params.timestamp,
                platformTimeExcluded: props.params.timestampExcluded,
                platformTimeBound: props.params.timestampBound,
                platformTimeBoundExcluded: props.params.timestampBoundExcluded,
            },
            filters: {
                btRunNo: props.filters.backtestingRunId,
                include: {
                    level: props.filters.include?.level,
                    actorKey: props.filters.include?.actorKey,
                    actorGroup: props.filters.include?.actorGroup,
                    messageContains: props.filters.include?.message,
                },
                exclude: {
                    actorKey: props.filters.exclude?.actorKey,
                    actorGroup: props.filters.exclude?.actorGroup,
                    messageContains: props.filters.exclude?.message,
                },
            },
        };
    },
    getPipe: () => {
        return mapValueDescriptor((vd) => {
            return createSyncedValueDescriptor(tryFixFingerprints(vd.value.payload.productLog));
        });
    },
});
