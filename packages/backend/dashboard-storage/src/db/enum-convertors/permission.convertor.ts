import { assertFail } from '@common/utils';
import type { TPermission } from '@grpc-schemas/dashboard_storage-api-sdk/index.services.dashboard_storage.v1';

import { Permission } from '../../def/response.ts';

export const toGrcpPermission = (status: Permission): TPermission => {
    switch (status) {
        case Permission.Owner:
            return 'PERMISSION_OWNER';
        case Permission.Editor:
            return 'PERMISSION_EDITOR';
        case Permission.Viewer:
            return 'PERMISSION_VIEWER';
        case Permission.None:
            return 'PERMISSION_NONE';
    }
};

export const fromGrpcPermission = (grpcPermission: TPermission): Permission => {
    switch (grpcPermission) {
        case 'PERMISSION_OWNER':
            return Permission.Owner;
        case 'PERMISSION_EDITOR':
            return Permission.Editor;
        case 'PERMISSION_VIEWER':
            return Permission.Viewer;
        case 'PERMISSION_NONE':
            return Permission.None;
        case 'PERMISSION_UNSPECIFIED':
            assertFail(grpcPermission);
    }
};
