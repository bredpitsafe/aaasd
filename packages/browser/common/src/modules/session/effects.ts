import { isEqual, isNull, isString } from 'lodash-es';
import {
    distinctUntilChanged,
    filter,
    map,
    Observable,
    of,
    shareReplay,
    Subject,
    switchMap,
    tap,
} from 'rxjs';

import { TSocketName } from '../../types/domain/sockets';
import { isAuthRequiredSocket } from '../../utils/url';
import {
    keycloakProfile$,
    keycloakToken$,
    login as keycloakLogin,
    logout as keycloakLogout,
} from '../keycloak';
import { getCurrentSocket$ } from '../socketPage';
import { TUser, TUserName } from '../user';
import { ESessionTypes, TSession } from './domain';

export function startSessionEffects(in$: Subject<TSession>) {
    getCurrentSocket$()
        .pipe(
            filter((socket): socket is TSocketName => isString(socket)),
            map(
                (socket): TSession => ({
                    type: isAuthRequiredSocket(socket)
                        ? ESessionTypes.Auth
                        : ESessionTypes.AuthNotRequired,
                }),
            ),
        )
        .subscribe(in$);

    in$.pipe(
        distinctUntilChanged(isEqual),
        tap((session) => {
            if (session.type === ESessionTypes.Auth) {
                keycloakLogin();
            } else if (session.type === ESessionTypes.NotAuth) {
                keycloakLogout();
            }
        }),
        shareReplay(1),
    ).subscribe();
}

export function startTokenEffects(in$: Subject<string | null>) {
    keycloakToken$.subscribe(in$);
}

export function startUserEffects(session$: Observable<TSession>, in$: Subject<TUser | null>) {
    session$
        .pipe(
            switchMap(({ type }) =>
                type === ESessionTypes.Auth
                    ? keycloakProfile$.pipe(
                          map((keycloakUser) => {
                              return isNull(keycloakUser)
                                  ? null
                                  : {
                                        username: keycloakUser.username as TUserName,
                                    };
                          }),
                      )
                    : of(null),
            ),
        )
        .subscribe(in$);
}
