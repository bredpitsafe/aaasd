import type { Assign } from '@common/types';
import type {
    TFetchPolicyTemplateSnapshotRequest,
    TFetchPolicyTemplateSnapshotResponse,
} from '@grpc-schemas/authorization-api-sdk/services/authorization/v1/policy_template_api.js';

import type { WithMock } from '../../../def/mock.ts';

export type TFetchPolicyTemplateSnapshotRequestPayload = WithMock<
    Assign<
        TFetchPolicyTemplateSnapshotRequest,
        {
            type: 'FetchPolicyTemplateSnapshot';
        }
    >
>;

export type TFetchPolicyTemplateSnapshotResponsePayload = TFetchPolicyTemplateSnapshotResponse & {
    type: 'Snapshot';
};
