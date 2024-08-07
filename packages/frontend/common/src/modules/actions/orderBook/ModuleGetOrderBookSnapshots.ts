import { isNil } from 'lodash-es';

import { EErrorReason } from '../../../lib/SocketStream/def';
import { SocketStreamError } from '../../../lib/SocketStream/SocketStreamError';
import { EGrpcErrorCode } from '../../../types/GrpcError';
import { createRemoteProcedureCall } from '../../../utils/RPC/createRemoteProcedureCall';
import { createRemoteProcedureDescriptor } from '../../../utils/RPC/createRemoteProcedureDescriptor';
import { EPlatformSocketRemoteProcedureName, ERemoteProcedureType } from '../../../utils/RPC/defs';
import { mapValueDescriptor } from '../../../utils/Rx/ValueDescriptor2';
import type { TOrderBookFilter, TOrderBookSnapshot, TOrderBookSnapshotParams } from './defs.ts';

type TSendBody = {
    filters: TOrderBookFilter;
    params: TOrderBookSnapshotParams;
};

type TReceiveBody = TOrderBookSnapshot & {
    type: 'L2BookSnapshot';
};

const descriptor = createRemoteProcedureDescriptor<TSendBody, TReceiveBody>()(
    EPlatformSocketRemoteProcedureName.FetchL2BookSnapshot,
    ERemoteProcedureType.Request,
);

export const ModuleGetOrderBookSnapshots = createRemoteProcedureCall(descriptor)({
    getPipe: (params) =>
        mapValueDescriptor(({ value: envelope }) => {
            if (isNil(envelope.payload)) {
                throw new SocketStreamError('Incorrect response for FetchL2BookSnapshot', {
                    code: EGrpcErrorCode.UNKNOWN,
                    reason: EErrorReason.serverError,
                    traceId: envelope.traceId,
                    correlationId: envelope.correlationId,
                    socketURL: 'url' in params.target ? params.target.url : params.target,
                });
            }

            return envelope.payload;
        }),
});
