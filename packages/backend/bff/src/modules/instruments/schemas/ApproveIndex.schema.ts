import type { Assign } from '@common/types';
import type {
    TApproveIndexRequest,
    TApproveIndexResponse,
} from '@grpc-schemas/instruments-api-sdk/services/instruments/v1/index_api.js';

import type { WithMock } from '../../../def/mock.ts';

export type TApproveIndexRequestPayload = WithMock<
    Assign<
        TApproveIndexRequest,
        {
            type: 'ApproveIndex';
        }
    >
>;

/** @public */
export type TApproveIndexResponsePayload = Assign<
    TApproveIndexResponse,
    {
        type: 'IndexApproved';
    }
>;
