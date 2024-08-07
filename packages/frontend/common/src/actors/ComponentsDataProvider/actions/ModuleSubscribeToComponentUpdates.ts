import { seconds2nanoseconds, toSeconds } from '@common/utils';
import { pipe } from 'rxjs';

import type { TRequestStreamOptions, TSubscribed } from '../../../modules/actions/def.ts';
import {
    filterOutSubscribedValueDescriptor,
    serverGateToGate,
} from '../../../modules/actions/utils.ts';
import { EComponentType } from '../../../types/domain/component.ts';
import type { TGate } from '../../../types/domain/gates.ts';
import type { TRobot } from '../../../types/domain/robots.ts';
import type { TServer } from '../../../types/domain/servers.ts';
import type { TSocketStruct, TSocketURL } from '../../../types/domain/sockets.ts';
import { createRemoteProcedureCall } from '../../../utils/RPC/createRemoteProcedureCall.ts';
import { createRemoteProcedureDescriptor } from '../../../utils/RPC/createRemoteProcedureDescriptor.ts';
import {
    EPlatformSocketRemoteProcedureName,
    ERemoteProcedureType,
} from '../../../utils/RPC/defs.ts';
import { mapValueDescriptor } from '../../../utils/Rx/ValueDescriptor2.ts';

type TSendBody = TRequestStreamOptions;

type TReceiveBody =
    | TSubscribed
    | {
          type: 'ComponentUpdate';
          instances: TServer[];
          mdGates: Omit<TGate, 'type'>[];
          execGates: Omit<TGate, 'type'>[];
          robots: TRobot[];
          componentRemovalEnabled: boolean;
      };

const descriptor = createRemoteProcedureDescriptor<TSendBody, TReceiveBody>()(
    EPlatformSocketRemoteProcedureName.SubscribeComponentUpdates,
    ERemoteProcedureType.Subscribe,
);

export const ModuleSubscribeToComponentUpdates = createRemoteProcedureCall(descriptor)({
    getParams: (params: { target: TSocketURL | TSocketStruct } & TSendBody) => ({
        target: params.target,
        pollInterval: params.pollInterval ?? seconds2nanoseconds(toSeconds(1)),
    }),
    getPipe: () =>
        pipe(
            filterOutSubscribedValueDescriptor(),
            mapValueDescriptor(({ value: event }) => {
                const { instances, robots, mdGates, execGates } = event.payload;

                return {
                    servers: instances,
                    robots: robots,
                    gates: [
                        ...(mdGates || []).map((gate) =>
                            serverGateToGate(gate, EComponentType.mdGate),
                        ),
                        ...(execGates || []).map((gate) =>
                            serverGateToGate(gate, EComponentType.execGate),
                        ),
                    ],
                    componentRemovalEnabled: event.payload.componentRemovalEnabled,
                };
            }),
        ),
});
