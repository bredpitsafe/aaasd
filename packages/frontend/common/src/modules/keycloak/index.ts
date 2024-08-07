import {
    keycloakLoginDescriptor,
    keycloakLogoutDescriptor,
} from '../../actors/Keycloak/descriptors.ts';
import { createRemoteProcedureCall } from '../../utils/RPC/createRemoteProcedureCall.ts';

export const ModuleKeycloakLogin = createRemoteProcedureCall(keycloakLoginDescriptor)();
export const ModuleKeycloakLogout = createRemoteProcedureCall(keycloakLogoutDescriptor)();
