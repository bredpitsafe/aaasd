import { isNil } from 'lodash-es';

import type {
    TOrderBookFilter,
    TOrderBookSnapshot,
    TOrderBookSnapshotParams,
} from '../../../handlers/OrderBook/defs';
import { EErrorReason } from '../../../lib/SocketStream/def';
import { SocketStreamError } from '../../../lib/SocketStream/SocketStreamError';
import { EGrpcErrorCode } from '../../../types/GrpcError';
import { createRemoteProcedureCall } from '../../../utils/RPC/createRemoteProcedureCall';
import { createRemoteProcedureDescriptor } from '../../../utils/RPC/createRemoteProcedureDescriptor';
import { ERemoteProcedureType, EServerRemoteProcedureName } from '../../../utils/RPC/defs';
import { mapValueDescriptor } from '../../../utils/Rx/ValueDescriptor2';

type TSendBody = {
    filters: TOrderBookFilter;
    params: TOrderBookSnapshotParams;
};

type TReceiveBody = TOrderBookSnapshot & {
    type: 'L2BookSnapshot';
};

const descriptor = createRemoteProcedureDescriptor<TSendBody, TReceiveBody>()(
    EServerRemoteProcedureName.FetchL2BookSnapshot,
    ERemoteProcedureType.Request,
);

export const ModuleGetOrderBookSnapshots = createRemoteProcedureCall(descriptor)({
    getPipe: () =>
        mapValueDescriptor(({ value: envelope }) => {
            if (isNil(envelope.payload)) {
                throw new SocketStreamError('Incorrect response for FetchL2BookSnapshot', {
                    code: EGrpcErrorCode.UNKNOWN,
                    reason: EErrorReason.serverError,
                    traceId: envelope.traceId,
                    correlationId: envelope.correlationId,
                });
            }

            return envelope.payload;
        }),
});
