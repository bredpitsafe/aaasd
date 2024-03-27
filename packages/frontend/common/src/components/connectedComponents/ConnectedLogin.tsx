import { isNil, isUndefined } from 'lodash-es';
import { ReactElement } from 'react';

import {
    AuthenticationProps,
    EAuthenticationSelectors,
} from '../../../e2e/selectors/authentication';
import { ESessionTypes, getSession$, getSessionUser$, login, logout } from '../../modules/session';
import { useFunction } from '../../utils/React/useFunction';
import { useSyncObservable } from '../../utils/React/useSyncObservable';
import { Button } from '../Button';

export function ConnectedLogin(): ReactElement | null {
    const session = useSyncObservable(getSession$());
    const user = useSyncObservable(getSessionUser$());

    const changeSessionType = useFunction(() => {
        if (session?.type === ESessionTypes.Auth) {
            logout();
        } else if (session?.type === ESessionTypes.NotAuth) {
            login();
        }
    });

    if (session?.type === ESessionTypes.AuthNotRequired) return null;

    const loading =
        isUndefined(session) ||
        isUndefined(user) ||
        (session.type === ESessionTypes.Auth && isNil(user)) ||
        (session.type === ESessionTypes.NotAuth && !isNil(user));

    return (
        <Button
            {...AuthenticationProps[EAuthenticationSelectors.LogOutButton]}
            size="small"
            onClick={changeSessionType}
            disabled={loading}
            loading={loading}
            title={session?.type === ESessionTypes.Auth ? 'Click to log out' : 'Click to log in'}
        >
            {user && user.username ? user.username : 'Login'}
        </Button>
    );
}
