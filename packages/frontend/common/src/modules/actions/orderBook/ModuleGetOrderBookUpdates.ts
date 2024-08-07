import { isNil } from 'lodash-es';

import { EErrorReason } from '../../../lib/SocketStream/def';
import { SocketStreamError } from '../../../lib/SocketStream/SocketStreamError';
import { EGrpcErrorCode } from '../../../types/GrpcError';
import { createRemoteProcedureCall } from '../../../utils/RPC/createRemoteProcedureCall';
import { createRemoteProcedureDescriptor } from '../../../utils/RPC/createRemoteProcedureDescriptor';
import { EPlatformSocketRemoteProcedureName, ERemoteProcedureType } from '../../../utils/RPC/defs';
import { mapValueDescriptor } from '../../../utils/Rx/ValueDescriptor2';
import type { TOrderBookFilter, TOrderBookUpdate, TOrderBookUpdateParams } from './defs.ts';

type TSendBody = {
    filters: TOrderBookFilter;
    params: TOrderBookUpdateParams;
};

type TReceiveBody = {
    type: 'L2BookUpdates';
    updates: TOrderBookUpdate[];
};

const descriptor = createRemoteProcedureDescriptor<TSendBody, TReceiveBody>()(
    EPlatformSocketRemoteProcedureName.FetchL2BookUpdates,
    ERemoteProcedureType.Request,
);

export const ModuleGetOrderBookUpdates = createRemoteProcedureCall(descriptor)({
    getPipe: (params) =>
        mapValueDescriptor(({ value: envelope }) => {
            if (isNil(envelope.payload)) {
                throw new SocketStreamError('Incorrect response for FetchL2BookUpdates', {
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
