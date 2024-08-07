import type { Assign } from '@common/types';
import type {
    TSubscribeToPermissionsRequest,
    TSubscribeToPermissionsResponse,
} from '@grpc-schemas/authorization-api-sdk/services/authorization/v1/permission_api.js';

import type { WithMock } from '../../../def/mock.ts';

export type TSubscribeToPermissionsRequestPayload = WithMock<
    Assign<
        TSubscribeToPermissionsRequest,
        {
            type: 'SubscribeToPermissions';
        }
    >
>;

export type TSubscribeToPermissionsResponsePayload = TSubscribeToPermissionsResponse & {
    type: 'Updates';
};
