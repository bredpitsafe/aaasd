import type { TRpcApi } from '../../def/rpc.ts';
import type { TStageName } from '../../def/stages.ts';
import type {
    TFetchPolicyTemplateSnapshotRequestPayload,
    TFetchPolicyTemplateSnapshotResponsePayload,
} from './schemas/FetchPolicyTemplateSnapshot.schema.ts';
import type {
    TGrantPolicyRequestPayload,
    TGrantPolicyResponsePayload,
} from './schemas/GrantPolicy.schema.ts';
import type {
    TRemovePolicyRequestPayload,
    TRemovePolicyResponsePayload,
} from './schemas/RemovePolicy.schema.ts';
import type {
    TRenderPolicyRequestPayload,
    TRenderPolicyResponsePayload,
} from './schemas/RenderPolicy.schema.ts';
import type {
    TRevokePolicyRequestPayload,
    TRevokePolicyResponsePayload,
} from './schemas/RevokePolicy.schema.ts';
import type {
    TSubscribeToGroupSnapshotRequestPayload,
    TSubscribeToGroupSnapshotResponsePayload,
} from './schemas/SubscribeToGroupSnapshot.schema.ts';
import type {
    TSubscribeToPermissionsRequestPayload,
    TSubscribeToPermissionsResponsePayload,
} from './schemas/SubscribeToPermissions.schema.ts';
import type {
    TSubscribeToPolicySnapshotRequestPayload,
    TSubscribeToPolicySnapshotResponsePayload,
} from './schemas/SubscribeToPolicySnapshot.schema.ts';
import type {
    TSubscribeToUserSnapshotRequestPayload,
    TSubscribeToUserSnapshotResponsePayload,
} from './schemas/SubscribeToUserSnapshot.schema.ts';
import type {
    TUpsertPolicyRequestPayload,
    TUpsertPolicyResponsePayload,
} from './schemas/UpsertPolicy.schema.ts';

export const AUTHORIZATION_REQUEST_STAGE = 'authz' as TStageName;

export enum EAuthorizationRouteName {
    // Users
    SubscribeToUserSnapshot = 'SubscribeToUserSnapshot',

    // Groups API

    SubscribeToGroupSnapshot = 'SubscribeToGroupSnapshot',

    // Permissions API
    SubscribeToPermissions = 'SubscribeToPermissions',

    // Policies API
    SubscribeToPolicySnapshot = 'SubscribeToPolicySnapshot',
    GrantPolicy = 'GrantPolicy',
    UpsertPolicy = 'UpsertPolicy',
    RemovePolicy = 'RemovePolicy',
    RenderPolicy = 'RenderPolicy',
    RevokePolicy = 'RevokePolicy',

    // Policy Templates API
    FetchPolicyTemplateSnapshot = 'FetchPolicyTemplateSnapshot',
}

export type TAuthorizationRoutesMap = {
    [EAuthorizationRouteName.SubscribeToGroupSnapshot]: TRpcApi<
        TSubscribeToGroupSnapshotRequestPayload,
        TSubscribeToGroupSnapshotResponsePayload
    >;
    [EAuthorizationRouteName.SubscribeToUserSnapshot]: TRpcApi<
        TSubscribeToUserSnapshotRequestPayload,
        TSubscribeToUserSnapshotResponsePayload
    >;
    [EAuthorizationRouteName.SubscribeToPermissions]: TRpcApi<
        TSubscribeToPermissionsRequestPayload,
        TSubscribeToPermissionsResponsePayload
    >;
    [EAuthorizationRouteName.SubscribeToPolicySnapshot]: TRpcApi<
        TSubscribeToPolicySnapshotRequestPayload,
        TSubscribeToPolicySnapshotResponsePayload
    >;
    [EAuthorizationRouteName.UpsertPolicy]: TRpcApi<
        TUpsertPolicyRequestPayload,
        TUpsertPolicyResponsePayload
    >;
    [EAuthorizationRouteName.RemovePolicy]: TRpcApi<
        TRemovePolicyRequestPayload,
        TRemovePolicyResponsePayload
    >;

    [EAuthorizationRouteName.RenderPolicy]: TRpcApi<
        TRenderPolicyRequestPayload,
        TRenderPolicyResponsePayload
    >;

    [EAuthorizationRouteName.GrantPolicy]: TRpcApi<
        TGrantPolicyRequestPayload,
        TGrantPolicyResponsePayload
    >;

    [EAuthorizationRouteName.RevokePolicy]: TRpcApi<
        TRevokePolicyRequestPayload,
        TRevokePolicyResponsePayload
    >;

    [EAuthorizationRouteName.FetchPolicyTemplateSnapshot]: TRpcApi<
        TFetchPolicyTemplateSnapshotRequestPayload,
        TFetchPolicyTemplateSnapshotResponsePayload
    >;
};
