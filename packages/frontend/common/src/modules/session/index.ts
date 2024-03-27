import { Observable } from 'rxjs';

import { login as keycloakLogin, logout as keycloakLogout } from '../keycloak';
import { TUser } from '../user';
import { ESessionTypes, TSession } from './domain';
import { startSessionEffects, startTokenEffects, startUserEffects } from './effects';
import { sessionIn$, sessionOut$, tokenIn$, tokenOut$, userIn$, userOut$ } from './model';

export { ESessionTypes, type TSession } from './domain';

startSessionEffects(sessionIn$);

export function getSession$() {
    return sessionOut$;
}

export function setSession(session: TSession) {
    sessionIn$.next(session);
}

export function login() {
    setSession({ type: ESessionTypes.Auth });
    keycloakLogin();
}

export function logout() {
    setSession({ type: ESessionTypes.NotAuth });
    keycloakLogout();
}

startTokenEffects(tokenIn$);

export function getSessionToken$(): Observable<string | null> {
    return tokenOut$;
}

export function setSessionToken(token: string | null) {
    tokenIn$.next(token);
}

startUserEffects(sessionOut$, userIn$);

export function getSessionUser$(): Observable<TUser | null> {
    return userOut$;
}
