import type { Assign } from '@common/types';
import type {
    TGrantPolicyRequest,
    TGrantPolicyResponse,
} from '@grpc-schemas/authorization-api-sdk/services/authorization/v1/policy_api.js';

import type { WithMock } from '../../../def/mock.ts';

export type TGrantPolicyRequestPayload = WithMock<
    Assign<
        TGrantPolicyRequest,
        {
            type: 'GrantPolicy';
        }
    >
>;

export type TGrantPolicyResponsePayload = TGrantPolicyResponse & {
    type: 'PolicyGranted';
};
