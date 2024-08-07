import type { TUser } from '../../modules/user';
import type { EDomainName } from '../../types/domain/evironment.ts';
import { createRemoteProcedureDescriptor } from '../../utils/RPC/createRemoteProcedureDescriptor.ts';
import { EActorRemoteProcedureName, ERemoteProcedureType } from '../../utils/RPC/defs.ts';
import type { TSession } from './domain.ts';

export const sessionLoginDescriptor = createRemoteProcedureDescriptor<
    { name: EDomainName },
    undefined
>()(EActorRemoteProcedureName.SessionLogin, ERemoteProcedureType.Update);

export const sessionLogoutDescriptor = createRemoteProcedureDescriptor<
    { name: undefined | EDomainName },
    undefined[]
>()(EActorRemoteProcedureName.SessionLogout, ERemoteProcedureType.Update);

export const SubscribeToSessionDescriptor = createRemoteProcedureDescriptor<
    { name: EDomainName },
    null | TSession
>()(EActorRemoteProcedureName.SubscribeToSession, ERemoteProcedureType.Subscribe);

export const SubscribeToSessionTokenDescriptor = createRemoteProcedureDescriptor<
    { name: EDomainName },
    null | string
>()(EActorRemoteProcedureName.SubscribeToSessionToken, ERemoteProcedureType.Subscribe);

export const SubscribeToSessionUserDescriptor = createRemoteProcedureDescriptor<
    { name: EDomainName },
    null | TUser
>()(EActorRemoteProcedureName.SubscribeToSessionUser, ERemoteProcedureType.Subscribe);
