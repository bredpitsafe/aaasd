import type {
    TFetchPolicyTemplateSnapshotRequest,
    TFetchPolicyTemplateSnapshotResponse,
} from '@grpc-schemas/authorization-api-sdk/services/authorization/v1/policy_template_api';

import type { TRpcRouteTransformers } from '../../../rpc/def.ts';
import type { EAuthorizationRouteName } from '../def.ts';

export const fetchPolicyTemplatesSnapshotTransformers: TRpcRouteTransformers<
    EAuthorizationRouteName.FetchPolicyTemplateSnapshot,
    TFetchPolicyTemplateSnapshotRequest,
    TFetchPolicyTemplateSnapshotResponse
> = {
    fromRequestToGrpc(req) {
        return req.payload;
    },
    fromGrpcToResponse(res) {
        return { type: 'Snapshot', ...res };
    },
};
