import { isNull } from 'lodash-es';
import type { Observable, Subject } from 'rxjs';
import { map, of, switchMap } from 'rxjs';
import { filter } from 'rxjs/operators';

import type { TContextRef } from '../../di';
import { ModuleActor } from '../../modules/actor';
import type { TUser, TUserName } from '../../modules/user';
import type { EDomainName, TKeycloakToken } from '../../types/domain/evironment.ts';
import {
    publishToKeycloakProfileEnvBox,
    publishToKeycloakTokenEnvBox,
} from '../Keycloak/descriptors.ts';
import type { TSession } from './domain';
import { ESessionTypes } from './domain';

export function startTokenEffects(
    ctx: TContextRef,
    name: EDomainName,
    tokenIn$: Subject<null | TKeycloakToken>,
) {
    const actor = ModuleActor(ctx);
    const sub = publishToKeycloakTokenEnvBox
        .as$(actor)
        .subscribe(({ payload }) => payload.name === name && tokenIn$.next(payload.token));

    return () => sub.unsubscribe();
}

export function startUserEffects(
    ctx: TContextRef,
    name: EDomainName,
    sessionOut$: Observable<TSession>,
    userIn$: Subject<TUser | null>,
) {
    const actor = ModuleActor(ctx);
    const sub = sessionOut$
        .pipe(
            switchMap(({ type }) =>
                type === ESessionTypes.Auth
                    ? publishToKeycloakProfileEnvBox.as$(actor).pipe(
                          filter(({ payload }) => payload.name === name),
                          map(({ payload: { profile } }) => {
                              return isNull(profile)
                                  ? null
                                  : { username: profile.username as TUserName };
                          }),
                      )
                    : of(null),
            ),
        )
        .subscribe(userIn$);

    return () => sub.unsubscribe();
}
