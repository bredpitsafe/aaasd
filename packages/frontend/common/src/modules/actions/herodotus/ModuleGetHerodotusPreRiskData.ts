import type { TInstrument, TInstrumentId } from '../../../types/domain/instrument.ts';
import type { TRobotId } from '../../../types/domain/robots.ts';
import { createRemoteProcedureCall } from '../../../utils/RPC/createRemoteProcedureCall.ts';
import { createRemoteProcedureDescriptor } from '../../../utils/RPC/createRemoteProcedureDescriptor.ts';
import {
    EPlatformSocketRemoteProcedureName,
    ERemoteProcedureType,
} from '../../../utils/RPC/defs.ts';
import { mapValueDescriptor } from '../../../utils/Rx/ValueDescriptor2.ts';
import { createSyncedValueDescriptor } from '../../../utils/ValueDescriptor/utils.ts';

export type THerodotusPreRiskData = {
    name: TInstrument['name'];
    maxOrderAmount: number;
    aggression: number;
    aggressionAmount: number;
};

type TSendBody = {
    robotId: TRobotId;
    instrumentId: TInstrumentId;
};

type TReceivedBody = {
    type: 'HerodotusPreRiskData';
    preRisk: null | THerodotusPreRiskData;
};

const descriptor = createRemoteProcedureDescriptor<TSendBody, TReceivedBody>()(
    EPlatformSocketRemoteProcedureName.GetHerodotusPreRiskData,
    ERemoteProcedureType.Request,
);

export const ModuleGetHerodotusPreRiskData = createRemoteProcedureCall(descriptor)({
    getPipe: () =>
        mapValueDescriptor(({ value }) => createSyncedValueDescriptor(value.payload.preRisk)),
});
