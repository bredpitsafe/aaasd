import type {
    EDomainName,
    TKeycloakProfile,
    TKeycloakToken,
} from '../../types/domain/evironment.ts';
import { createActorEnvelopeBox } from '../../utils/Actors';
import { createRemoteProcedureDescriptor } from '../../utils/RPC/createRemoteProcedureDescriptor.ts';
import { EActorRemoteProcedureName, ERemoteProcedureType } from '../../utils/RPC/defs.ts';

export const publishToKeycloakProfileEnvBox = createActorEnvelopeBox<{
    name: EDomainName;
    profile: null | TKeycloakProfile;
}>()(EActorRemoteProcedureName.PublishKeycloakProfile);

export const publishToKeycloakTokenEnvBox = createActorEnvelopeBox<{
    name: EDomainName;
    token: null | TKeycloakToken;
}>()(EActorRemoteProcedureName.PublishKeycloakToken);

export const keycloakLoginDescriptor = createRemoteProcedureDescriptor<
    { name: EDomainName },
    undefined
>()(EActorRemoteProcedureName.KeycloakLogin, ERemoteProcedureType.Update);

export const keycloakLogoutDescriptor = createRemoteProcedureDescriptor<
    { name: EDomainName },
    undefined
>()(EActorRemoteProcedureName.KeycloakLogout, ERemoteProcedureType.Update);

export const keycloakReloginDescriptor = createRemoteProcedureDescriptor<
    { name: EDomainName },
    true
>()(EActorRemoteProcedureName.KeycloakRelogin, ERemoteProcedureType.Update);
