import { toMilliseconds } from '@common/utils';

import type { TClientComponentConfig, TComponentId } from '../../../types/domain/component.ts';
import type { TWithSocketTarget } from '../../../types/domain/sockets.ts';
import { createRemoteProcedureCall } from '../../../utils/RPC/createRemoteProcedureCall.ts';
import { createRemoteProcedureDescriptor } from '../../../utils/RPC/createRemoteProcedureDescriptor.ts';
import {
    EPlatformSocketRemoteProcedureName,
    ERemoteProcedureType,
} from '../../../utils/RPC/defs.ts';
import type { TComponentConfig, TWithPollInterval, TWithServerPollInterval } from '../def.ts';
import { convertToSubscriptionEventValueDescriptor, pollIntervalForRequest } from '../utils.ts';

type TSendBody = TWithServerPollInterval & {
    componentId: TComponentId;
    lastDigest: string | null;
};

type TComponentConfigSame = Omit<TComponentConfig, 'config'> & {
    config: TComponentConfig['config'] | null;
};

type TReceiveBody = TComponentConfig | TComponentConfigSame;

const describe = createRemoteProcedureDescriptor<TSendBody, TReceiveBody>()(
    EPlatformSocketRemoteProcedureName.SubscribeToComponentConfigUpdates,
    ERemoteProcedureType.Subscribe,
);

export const ModuleSubscribeToComponentConfigUpdates = createRemoteProcedureCall(describe)({
    getParams: (
        params: TWithSocketTarget &
            TWithPollInterval & {
                componentId: TComponentId;
                lastDigest: string | null;
            },
    ) => {
        return {
            ...params,
            pollInterval: pollIntervalForRequest(params?.pollInterval ?? toMilliseconds(1000)),
        };
    },
    getPipe: () =>
        convertToSubscriptionEventValueDescriptor(
            ({ componentId, user, platformTime, config, digest }): TClientComponentConfig => {
                return {
                    componentId,
                    updatedBy: { username: user },
                    updatedAt: platformTime,
                    raw: config || '',
                    digest,
                };
            },
        ),
});
