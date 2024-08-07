import { isEqual } from 'lodash-es';
import { distinctUntilChanged, ReplaySubject, shareReplay } from 'rxjs';

import type { TUser } from '../../modules/user';
import type { TKeycloakToken } from '../../types/domain/evironment.ts';
import type { TSession } from './domain';

export type TSessionInstance = ReturnType<typeof createSessionInstance>;

export function createSessionInstance() {
    const tokenIn$ = new ReplaySubject<null | TKeycloakToken>(1);
    const tokenOut$ = tokenIn$.pipe(distinctUntilChanged(), shareReplay(1));

    const sessionIn$ = new ReplaySubject<TSession>(1);
    const sessionOut$ = sessionIn$.pipe(
        distinctUntilChanged((a, b) => isEqual(a, b)),
        shareReplay(1),
    );

    const userIn$ = new ReplaySubject<null | TUser>(1);
    const userOut$ = userIn$.pipe(
        distinctUntilChanged((a, b) => isEqual(a, b)),
        shareReplay(1),
    );

    return {
        sessionIn$,
        sessionOut$,
        tokenIn$,
        tokenOut$,
        userIn$,
        userOut$,
    };
}
