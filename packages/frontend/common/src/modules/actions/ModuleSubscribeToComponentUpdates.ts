import { pipe } from 'rxjs';

import type { TRequestStreamOptions, TSubscribed } from '../../handlers/def';
import { filterOutSubscribedValueDescriptor, serverGateToGate } from '../../handlers/utils';
import { EComponentType } from '../../types/domain/component';
import type { TGate } from '../../types/domain/gates';
import type { TRobot } from '../../types/domain/robots';
import type { TServer } from '../../types/domain/servers';
import { TSocketStruct, TSocketURL } from '../../types/domain/sockets';
import { createRemoteProcedureCall } from '../../utils/RPC/createRemoteProcedureCall';
import { createRemoteProcedureDescriptor } from '../../utils/RPC/createRemoteProcedureDescriptor';
import { EPlatformSocketRemoteProcedureName, ERemoteProcedureType } from '../../utils/RPC/defs';
import { mapValueDescriptor } from '../../utils/Rx/ValueDescriptor2.ts';
import { seconds2nanoseconds, toSeconds } from '../../utils/time';

type TSendBody = TRequestStreamOptions;

type TReceiveBody =
    | TSubscribed
    | {
          type: 'ComponentUpdate';
          instances: TServer[];
          mdGates: Omit<TGate, 'type'>[];
          execGates: Omit<TGate, 'type'>[];
          robots: TRobot[];
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
                };
            }),
        ),
});
