import type {
    TUpdateProviderInstrumentsOverrideRequest,
    TUpdateProviderInstrumentsOverrideResponse,
} from '@grpc-schemas/instruments-api-sdk/services/instruments/v1/instrument_api.js';

import type { TRpcRouteTransformers } from '../../../rpc/def.ts';
import type { EInstrumentsRouteName } from '../def.ts';

export const updateProviderInstrumentsOverrideTransformers: TRpcRouteTransformers<
    EInstrumentsRouteName.UpdateProviderInstrumentsOverride,
    TUpdateProviderInstrumentsOverrideRequest,
    TUpdateProviderInstrumentsOverrideResponse
> = {
    fromRequestToGrpc(req) {
        return req.payload;
    },
    fromGrpcToResponse(res) {
        return { ...res, type: 'ProviderInstrumentsOverridden' };
    },
};
