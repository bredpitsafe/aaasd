import type { Assign } from '@common/types';
import type {
    TApproveAssetRequest,
    TApproveAssetResponse,
} from '@grpc-schemas/instruments-api-sdk/services/instruments/v1/asset_api.js';

import type { WithMock } from '../../../def/mock.ts';

export type TApproveAssetRequestPayload = WithMock<
    Assign<
        TApproveAssetRequest,
        {
            type: 'ApproveAsset';
        }
    >
>;

/** @public */
export type TApproveAssetResponsePayload = Assign<
    TApproveAssetResponse,
    {
        type: 'AssetApproved';
    }
>;
