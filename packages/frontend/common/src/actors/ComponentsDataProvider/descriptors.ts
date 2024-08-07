import type { TGate } from '../../types/domain/gates.ts';
import type { TRobot } from '../../types/domain/robots.ts';
import type { TServer } from '../../types/domain/servers.ts';
import type { TSocketStruct, TSocketURL } from '../../types/domain/sockets.ts';
import { createRemoteProcedureDescriptor } from '../../utils/RPC/createRemoteProcedureDescriptor';
import { EActorRemoteProcedureName, ERemoteProcedureType } from '../../utils/RPC/defs';

export const subscribeToComponentsSnapshotProcedureDescriptor = createRemoteProcedureDescriptor<
    { target: TSocketURL | TSocketStruct },
    {
        servers: TServer[];
        robots: TRobot[];
        gates: TGate[];
        componentRemovalEnabled: boolean;
    }
>()(EActorRemoteProcedureName.SubscribeToComponentsSnapshot, ERemoteProcedureType.Subscribe);
