import type { Server } from '@grpc/grpc-js';

import { groupService, GroupServiceService } from './group.ts';
import { permissionService, PermissionStreamerServiceService } from './permission.ts';
import { policyService, PolicyServiceService } from './policy.ts';
import { policyTemplateService, PolicyTemplateServiceService } from './policyTemplate.ts';
import { userService, UserServiceService } from './user.ts';

export const initAuthorizationService = (server: Server): void => {
    server.addService(UserServiceService, userService);
    server.addService(GroupServiceService, groupService);
    server.addService(PermissionStreamerServiceService, permissionService);
    server.addService(PolicyServiceService, policyService);
    server.addService(PolicyTemplateServiceService, policyTemplateService);
};
