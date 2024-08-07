import type { Assign } from '@common/types';
import type {
    TRevokePolicyRequest,
    TRevokePolicyResponse,
} from '@grpc-schemas/authorization-api-sdk/services/authorization/v1/policy_api.js';

import type { WithMock } from '../../../def/mock.ts';

export type TRevokePolicyRequestPayload = WithMock<
    Assign<
        TRevokePolicyRequest,
        {
            type: 'RevokePolicy';
        }
    >
>;

export type TRevokePolicyResponsePayload = TRevokePolicyResponse & {
    type: 'PolicyRevoked';
};
