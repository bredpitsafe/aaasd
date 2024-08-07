import type { Assign } from '@common/types';
import type {
    TRemovePolicyRequest,
    TRemovePolicyResponse,
} from '@grpc-schemas/authorization-api-sdk/services/authorization/v1/policy_api.js';

import type { WithMock } from '../../../def/mock.ts';

export type TRemovePolicyRequestPayload = WithMock<
    Assign<
        TRemovePolicyRequest,
        {
            type: 'RemovePolicy';
        }
    >
>;

export type TRemovePolicyResponsePayload = TRemovePolicyResponse & {
    type: 'PolicyRemoved';
};
