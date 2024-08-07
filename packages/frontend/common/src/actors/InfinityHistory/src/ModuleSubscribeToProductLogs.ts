import type { ISO } from '@common/types';
import { getNowMilliseconds, milliseconds2iso } from '@common/utils';

import type {
    TWithPollInterval,
    TWithServerPollInterval,
    TWithSnapshot,
    TWithUpdatesOnly,
} from '../../../modules/actions/def.ts';
import type {
    EProductLogLevel,
    TProductLog,
    TProductLogSubscriptionFilters,
} from '../../../modules/actions/productLogs/defs.ts';
import { tryFixFingerprints } from '../../../modules/actions/productLogs/utils.ts';
import {
    convertToSubscriptionEventValueDescriptor,
    pollIntervalForRequest,
} from '../../../modules/actions/utils.ts';
import type { TWithSocketTarget } from '../../../types/domain/sockets.ts';
import { createRemoteProcedureCall } from '../../../utils/RPC/createRemoteProcedureCall.ts';
import { createRemoteProcedureDescriptor } from '../../../utils/RPC/createRemoteProcedureDescriptor.ts';
import {
    EPlatformSocketRemoteProcedureName,
    ERemoteProcedureType,
} from '../../../utils/RPC/defs.ts';

export type TSendBody = TWithUpdatesOnly &
    TWithServerPollInterval & {
        btRunNo?: number;

        since?: ISO;
        till?: ISO;

        levelIncl?: EProductLogLevel[];

        actorKeyIncl?: string[];
        actorKeyExcl?: string[];

        actorGroupIncl?: string[];
        actorGroupExcl?: string[];

        messageContains?: string[];
        messageNotContains?: string[];
    };

type TReceiveBody = TWithSnapshot & {
    type: 'ProductLogRecordUpdates';
    updates: TProductLog[];
};

const descriptor = createRemoteProcedureDescriptor<TSendBody, TReceiveBody>()(
    EPlatformSocketRemoteProcedureName.SubscribeToProductLogs,
    ERemoteProcedureType.Subscribe,
);

export type TSubscribeToProductLogsProps = TWithSocketTarget &
    TWithUpdatesOnly &
    TWithPollInterval & {
        filters: TProductLogSubscriptionFilters;
    };

export const ModuleSubscribeToProductLogs = createRemoteProcedureCall(descriptor)({
    getParams: ({ target, filters, updatesOnly, pollInterval }: TSubscribeToProductLogsProps) => {
        return {
            target,

            btRunNo: filters.backtestingRunId,

            since: milliseconds2iso(filters.since ?? getNowMilliseconds()),
            till: filters.till === undefined ? undefined : milliseconds2iso(filters.till),

            levelIncl: filters.include?.level,

            actorKeyIncl: filters.include?.actorKey,
            actorKeyExcl: filters.exclude?.actorKey,

            actorGroupIncl: filters.include?.actorGroup,
            actorGroupExcl: filters.exclude?.actorGroup,

            messageContains: filters.include?.message,
            messageNotContains: filters.exclude?.message,

            updatesOnly: updatesOnly ?? false,
            pollInterval: pollIntervalForRequest(pollInterval),
        };
    },
    getPipe: () => {
        return convertToSubscriptionEventValueDescriptor((payload) => {
            return tryFixFingerprints(payload.updates);
        });
    },
});
