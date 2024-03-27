import type { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';

import { TReceivedData } from '../lib/BFFSocket/def';
import { EErrorReason } from '../lib/SocketStream/def';
import { SocketStreamError } from '../lib/SocketStream/SocketStreamError';
import { TFetchHandler, THandlerOptions } from '../modules/communicationHandlers/def';
import type { TAsset } from '../types/domain/asset';
import { EInstrumentStatus, TInstrument } from '../types/domain/instrument';
import { TSocketURL } from '../types/domain/sockets';
import { EGrpcErrorCode } from '../types/GrpcError';
import { tapError } from '../utils/Rx/tap';
import { logger } from '../utils/Tracing';
import { getTraceId } from './utils';

export enum EDictionaryType {
    assets,
    instruments,
}

export type TInstrumentsDictionaryParams = {
    filters?: {
        statuses?: EInstrumentStatus[];
        nameRegexes?: string[];
    };
};

type TParams = TInstrumentsDictionaryParams;

type TSendBody = {
    type: 'ListAssets' | 'ListInstrumentsV2';
} & TInstrumentsDictionaryParams;

type TReceiveBody = {
    [EDictionaryType.assets]: { assets: TAsset[] };
    [EDictionaryType.instruments]: { instruments: TInstrument[] };
};

const dictionaryToRequestTypeMap: Record<EDictionaryType, 'ListAssets' | 'ListInstrumentsV2'> = {
    [EDictionaryType.assets]: 'ListAssets',
    [EDictionaryType.instruments]: 'ListInstrumentsV2',
};

export function getDictionaryHandle<
    Type extends EDictionaryType,
    Payload extends TReceiveBody[Type],
>(
    handler: TFetchHandler,
    url: TSocketURL,
    dictionary: Type,
    options: THandlerOptions,
    params?: TParams,
): Observable<TReceivedData<Payload>> {
    const traceId = getTraceId(options);

    logger.trace('[getDictionaryHandle]: init observable', { traceId });

    const type = dictionaryToRequestTypeMap[dictionary];

    return handler<TSendBody, Payload>(url, { type, ...params }, { traceId }).pipe(
        take(1),
        map((envelope) => {
            if (envelope.payload === undefined) {
                const message = `Incorrect response for ${type}`;

                throw new SocketStreamError(message, {
                    code: EGrpcErrorCode.UNKNOWN,
                    reason: EErrorReason.serverError,
                    traceId: envelope.traceId,
                    correlationId: envelope.correlationId,
                    socketURL: url,
                });
            }

            return envelope;
        }),
        tapError((err: SocketStreamError) => logger.error(err)),
    );
}
