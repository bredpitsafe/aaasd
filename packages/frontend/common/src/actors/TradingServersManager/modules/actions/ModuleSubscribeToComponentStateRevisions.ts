import type { TSubscribed } from '../../../../modules/actions/def.ts';
import { convertToSubscriptionEventValueDescriptor } from '../../../../modules/actions/utils.ts';
import type { TBacktestingRunId } from '../../../../types/domain/backtestings.ts';
import type { TComponentId } from '../../../../types/domain/component.ts';
import type { TComponentStateRevision } from '../../../../types/domain/ComponentStateRevision.ts';
import { createRemoteProcedureCall } from '../../../../utils/RPC/createRemoteProcedureCall.ts';
import { createRemoteProcedureDescriptor } from '../../../../utils/RPC/createRemoteProcedureDescriptor.ts';
import {
    EPlatformSocketRemoteProcedureName,
    ERemoteProcedureType,
} from '../../../../utils/RPC/defs.ts';

type TSendBody = {
    componentId: TComponentId;
    btRunNo?: TBacktestingRunId;
};

type TUpdateBody = {
    type: 'ComponentStateRevisionUpdates';
    componentStates: Array<TComponentStateRevision>;
};

type TReceiveBody = TSubscribed | TUpdateBody;

const descriptor = createRemoteProcedureDescriptor<TSendBody, TReceiveBody>()(
    EPlatformSocketRemoteProcedureName.SubscribeToComponentStateRevisions,
    ERemoteProcedureType.Subscribe,
);

export const ModuleSubscribeToComponentStateRevisions = createRemoteProcedureCall(descriptor)({
    getPipe: () => convertToSubscriptionEventValueDescriptor((payload) => payload.componentStates),
});
