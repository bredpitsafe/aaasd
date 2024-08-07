import type {
    TApproveAssetRequest,
    TApproveAssetResponse,
} from '@grpc-schemas/instruments-api-sdk/services/instruments/v1/asset_api.js';

import type { TRpcRouteTransformers } from '../../../rpc/def.ts';
import type { EInstrumentsRouteName } from '../def.ts';

export const approveAssetTransformers: TRpcRouteTransformers<
    EInstrumentsRouteName.ApproveAsset,
    TApproveAssetRequest,
    TApproveAssetResponse
> = {
    fromRequestToGrpc(req) {
        return req.payload;
    },
    fromGrpcToResponse(res) {
        return { ...res, type: 'AssetApproved' };
    },
};
