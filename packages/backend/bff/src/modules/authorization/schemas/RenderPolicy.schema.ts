import type { Assign } from '@common/types';
import type {
    TRenderPolicyRequest,
    TRenderPolicyResponse,
} from '@grpc-schemas/authorization-api-sdk/services/authorization/v1/policy_api.js';

import type { WithMock } from '../../../def/mock.ts';

export type TRenderPolicyRequestPayload = WithMock<
    Assign<
        TRenderPolicyRequest,
        {
            type: 'RenderPolicy';
        }
    >
>;

export type TRenderPolicyResponsePayload = TRenderPolicyResponse & {
    type: 'PolicyRendered';
};
