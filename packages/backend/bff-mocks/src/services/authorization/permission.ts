import { faker } from '@faker-js/faker';
import type { PermissionStreamerServiceServer } from '@grpc-schemas/authorization-api-sdk/index.services.authorization.v1.js';

import { EActorName } from '../../def/actor.ts';
import { wrapWritableStream } from '../../utils/wrapWritableStream.ts';
import { randomPermission } from './generators/randomPermission.ts';
export { PermissionStreamerServiceService } from '@grpc-schemas/authorization-api-sdk/index.services.authorization.v1.js';

const TOTAL_ITEMS = 100;
const PERMISSIONS = faker.helpers.multiple(randomPermission, {
    count: TOTAL_ITEMS,
});

export const permissionService: PermissionStreamerServiceServer = {
    subscribeToPermissions: (stream) => {
        const call = wrapWritableStream(
            EActorName.AuthorizationService,
            permissionService.subscribeToPermissions.name,
            stream,
        );
        call.write({
            permissions: PERMISSIONS,
        });

        call.end();
    },
};
