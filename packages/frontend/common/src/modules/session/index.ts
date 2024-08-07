import type { Observable } from 'rxjs';
import { combineLatest } from 'rxjs';

import { keycloakReloginDescriptor } from '../../actors/Keycloak/descriptors.ts';
import {
    sessionLoginDescriptor,
    sessionLogoutDescriptor,
    SubscribeToSessionDescriptor,
    SubscribeToSessionTokenDescriptor,
    SubscribeToSessionUserDescriptor,
} from '../../actors/Session/descriptors.ts';
import type { TSession } from '../../actors/Session/domain.ts';
import { DEDUPE_REMOVE_DELAY, SHARE_RESET_DELAY } from '../../defs/observables.ts';
import type { EDomainName } from '../../types/domain/evironment.ts';
import { DOMAIN_NAMES } from '../../types/domain/evironment.ts';
import { createObservableProcedure } from '../../utils/LPC/createObservableProcedure.ts';
import { constantNormalizer } from '../../utils/observable/memo.ts';
import { createRemoteProcedureCall } from '../../utils/RPC/createRemoteProcedureCall.ts';
import { semanticHash } from '../../utils/semanticHash.ts';
import type { TValueDescriptor2 } from '../../utils/ValueDescriptor/types.ts';
import type { TUser } from '../user';
import { squashRecord } from './utils.ts';

export const ModuleSessionLogin = createRemoteProcedureCall(sessionLoginDescriptor)();
export const ModuleSessionLogout = createRemoteProcedureCall(sessionLogoutDescriptor)();
export const ModuleSessionRelogin = createRemoteProcedureCall(keycloakReloginDescriptor)();
export const ModuleSubscribeToSession = createRemoteProcedureCall(SubscribeToSessionDescriptor)({
    dedobs: {
        normalize: ([params]) => semanticHash.get(params, {}),
        resetDelay: SHARE_RESET_DELAY,
        removeDelay: DEDUPE_REMOVE_DELAY,
    },
});
export const ModuleSubscribeToSessionsRecord = createObservableProcedure(
    (ctx) => {
        const subscribe = ModuleSubscribeToSession(ctx);
        return (_, options) => {
            return combineLatest(
                DOMAIN_NAMES.reduce(
                    (acc, name) => {
                        acc[name] = subscribe({ name }, options);
                        return acc;
                    },
                    {} as Record<EDomainName, Observable<TValueDescriptor2<null | TSession>>>,
                ),
            ).pipe(squashRecord());
        };
    },
    {
        dedobs: {
            normalize: constantNormalizer,
            resetDelay: SHARE_RESET_DELAY,
            removeDelay: DEDUPE_REMOVE_DELAY,
        },
    },
);
export const ModuleSubscribeToSessionToken = createRemoteProcedureCall(
    SubscribeToSessionTokenDescriptor,
)({
    dedobs: {
        normalize: ([params]) => semanticHash.get(params, {}),
        resetDelay: SHARE_RESET_DELAY,
        removeDelay: DEDUPE_REMOVE_DELAY,
    },
});
export const ModuleSubscribeToSessionTokensRecord = createObservableProcedure(
    (ctx) => {
        const subscribe = ModuleSubscribeToSessionToken(ctx);
        return (_, options) => {
            return combineLatest(
                DOMAIN_NAMES.reduce(
                    (acc, name) => {
                        acc[name] = subscribe({ name }, options);
                        return acc;
                    },
                    {} as Record<EDomainName, Observable<TValueDescriptor2<null | string>>>,
                ),
            ).pipe(squashRecord());
        };
    },
    {
        dedobs: {
            normalize: constantNormalizer,
            resetDelay: SHARE_RESET_DELAY,
            removeDelay: DEDUPE_REMOVE_DELAY,
        },
    },
);

export const ModuleSubscribeToSessionUser = createRemoteProcedureCall(
    SubscribeToSessionUserDescriptor,
)({
    dedobs: {
        normalize: ([params]) => semanticHash.get(params, {}),
        resetDelay: SHARE_RESET_DELAY,
        removeDelay: DEDUPE_REMOVE_DELAY,
    },
});
export const ModuleSubscribeToSessionUsersRecord = createObservableProcedure(
    (ctx) => {
        const subscribe = ModuleSubscribeToSessionUser(ctx);

        return (_, options) => {
            return combineLatest(
                DOMAIN_NAMES.reduce(
                    (acc, name) => {
                        acc[name] = subscribe({ name }, options);
                        return acc;
                    },
                    {} as Record<EDomainName, Observable<TValueDescriptor2<null | TUser>>>,
                ),
            ).pipe(squashRecord());
        };
    },
    {
        dedobs: {
            normalize: constantNormalizer,
            resetDelay: SHARE_RESET_DELAY,
            removeDelay: DEDUPE_REMOVE_DELAY,
        },
    },
);
