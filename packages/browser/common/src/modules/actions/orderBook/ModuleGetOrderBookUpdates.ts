import { isNil } from 'lodash-es';

import {
    TOrderBookFilter,
    TOrderBookUpdate,
    TOrderBookUpdateParams,
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
    params: TOrderBookUpdateParams;
};

type TReceiveBody = {
    type: 'L2BookUpdates';
    updates: TOrderBookUpdate[];
};

const descriptor = createRemoteProcedureDescriptor<TSendBody, TReceiveBody>()(
    EServerRemoteProcedureName.FetchL2BookUpdates,
    ERemoteProcedureType.Request,
);

export const ModuleGetOrderBookUpdates = createRemoteProcedureCall(descriptor)({
    getPipe: () =>
        mapValueDescriptor(({ value: envelope }) => {
            if (isNil(envelope.payload)) {
                throw new SocketStreamError('Incorrect response for FetchL2BookUpdates', {
                    code: EGrpcErrorCode.UNKNOWN,
                    reason: EErrorReason.serverError,
                    traceId: envelope.traceId,
                    correlationId: envelope.correlationId,
                });
            }

            return envelope.payload;
        }),
});
