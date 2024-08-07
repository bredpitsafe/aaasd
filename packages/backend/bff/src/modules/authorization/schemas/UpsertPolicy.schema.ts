import type { Assign } from '@common/types';
import type {
    TUpsertPolicyRequest,
    TUpsertPolicyResponse,
} from '@grpc-schemas/authorization-api-sdk/services/authorization/v1/policy_api.js';

import type { WithMock } from '../../../def/mock.ts';

export type TUpsertPolicyRequestPayload = WithMock<
    Assign<
        TUpsertPolicyRequest,
        {
            type: 'UpsertPolicy';
        }
    >
>;

export type TUpsertPolicyResponsePayload = TUpsertPolicyResponse & {
    type: 'PolicyUpserted';
};
