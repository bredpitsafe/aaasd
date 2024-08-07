import { tapError } from '@common/rx';
import type { TraceId } from '@common/utils';
import { isNil } from 'lodash-es';
import type { Observable } from 'rxjs';
import { BehaviorSubject, forkJoin, of } from 'rxjs';
import { distinctUntilChanged, map, switchMap, tap } from 'rxjs/operators';

import { DEDUPE_REMOVE_DELAY } from '../../defs/observables.ts';
import { toContextRef } from '../../di';
import { ModuleKeycloakLogin, ModuleKeycloakLogout } from '../../modules/keycloak';
import type { TUser } from '../../modules/user';
import type { EDomainName } from '../../types/domain/evironment.ts';
import { createActor } from '../../utils/Actors';
import { dedobs } from '../../utils/observable/memo.ts';
import { ModuleRegisterActorRemoteProcedure } from '../../utils/RPC/registerRemoteProcedure.ts';
import { squashValueDescriptors } from '../../utils/Rx/ValueDescriptor2.ts';
import { createSyncedValueDescriptor } from '../../utils/ValueDescriptor/utils.ts';
import { EActorName } from '../Root/defs.ts';
import type { TSessionInstance } from './createSessionInstance.ts';
import { createSessionInstance } from './createSessionInstance.ts';
import {
    sessionLoginDescriptor,
    sessionLogoutDescriptor,
    SubscribeToSessionDescriptor,
    SubscribeToSessionTokenDescriptor,
    SubscribeToSessionUserDescriptor,
} from './descriptors.ts';
import type { TSession } from './domain.ts';
import { ESessionTypes } from './domain.ts';
import { startTokenEffects, startUserEffects } from './effects.ts';

export function createActorSession() {
    return createActor(EActorName.Session, (context) => {
        const ctx = toContextRef(context);
        const register = ModuleRegisterActorRemoteProcedure(ctx);
        const keycloakLogin = ModuleKeycloakLogin(ctx);
        const keycloakLogout = ModuleKeycloakLogout(ctx);

        const mapNameToInstance$ = new BehaviorSubject(new Map<EDomainName, TSessionInstance>());
        const addSessionInstance = (domain: EDomainName) => {
            const map = mapNameToInstance$.value;

            if (!map.has(domain)) {
                const instance = createSessionInstance();

                startTokenEffects(ctx, domain, instance.tokenIn$);
                startUserEffects(ctx, domain, instance.sessionOut$, instance.userIn$);

                map.set(domain, instance);
                mapNameToInstance$.next(map);
            }

            return map.get(domain)!;
        };
        const getSessionInstance$ = (domain: EDomainName) => {
            return mapNameToInstance$.pipe(map((map) => map.get(domain)));
        };

        function getSession$(name: EDomainName) {
            return getSessionInstance$(name).pipe(
                switchMap((inst) => inst?.sessionOut$ ?? of(null)),
                distinctUntilChanged(),
            );
        }

        function setSession(name: EDomainName, session: TSession): undefined {
            addSessionInstance(name).sessionIn$.next(session);
        }

        function getSessionToken$(name: EDomainName): Observable<string | null> {
            return getSessionInstance$(name).pipe(
                switchMap((inst) => inst?.tokenOut$ ?? of(null)),
                distinctUntilChanged(),
            );
        }

        function getSessionUser$(name: EDomainName): Observable<TUser | null> {
            return getSessionInstance$(name).pipe(
                switchMap((inst) => inst?.userOut$ ?? of(null)),
                distinctUntilChanged(),
            );
        }

        function login(name: EDomainName, traceId: TraceId) {
            return keycloakLogin({ name }, { traceId }).pipe(
                tap(() => setSession(name, { type: ESessionTypes.Auth })),
                tapError(() => setSession(name, { type: ESessionTypes.NotAuth })),
            );
        }

        function logout(name: undefined | EDomainName, traceId: TraceId) {
            const names = isNil(name)
                ? Array.from(mapNameToInstance$.value.entries())
                : [[name, mapNameToInstance$.value.get(name)] as const].filter(
                      (v): v is [EDomainName, TSessionInstance] => !isNil(v[1]),
                  );

            return forkJoin(
                names.map(([name, instance]) => {
                    instance.sessionIn$.next({ type: ESessionTypes.NotAuth });
                    instance.tokenIn$.next(null);
                    instance.userIn$.next(null);

                    return keycloakLogout({ name }, { traceId });
                }),
            ).pipe(squashValueDescriptors());
        }

        register(
            sessionLoginDescriptor,
            dedobs(({ name }, { traceId }) => login(name, traceId), {
                normalize: ([params]) => params.name,
                resetDelay: 0,
                removeDelay: DEDUPE_REMOVE_DELAY,
            }),
        );
        register(
            sessionLogoutDescriptor,
            dedobs(({ name }, { traceId }) => logout(name, traceId), {
                normalize: ([params]) => params.name,
                resetDelay: 0,
                removeDelay: DEDUPE_REMOVE_DELAY,
            }),
        );

        register(SubscribeToSessionDescriptor, ({ name }) =>
            getSession$(name).pipe(map(createSyncedValueDescriptor)),
        );
        register(SubscribeToSessionTokenDescriptor, ({ name }) =>
            getSessionToken$(name).pipe(map(createSyncedValueDescriptor)),
        );
        register(SubscribeToSessionUserDescriptor, ({ name }) =>
            getSessionUser$(name).pipe(map(createSyncedValueDescriptor)),
        );
    });
}
