import { isNull } from 'lodash-es';
import { memo } from 'react';

import { ESessionTypes, getSession$, getSessionUser$, login, logout } from '../../modules/session';
import { useFunction } from '../../utils/React/useFunction';
import { useSyncObservable } from '../../utils/React/useSyncObservable';
import { AuthenticationButton } from '../AuthenticationButton/AuthenticationButton';

export const ConnectedAuthenticationButton = memo(() => {
    const session = useSyncObservable(getSession$());
    const user = useSyncObservable(getSessionUser$());
    const sessionType = session?.type;

    const changeSessionType = useFunction(() => {
        if (sessionType === ESessionTypes.Auth) {
            logout();
        } else if (sessionType === ESessionTypes.NotAuth) {
            login();
        }
    });

    if (sessionType === ESessionTypes.AuthNotRequired) return null;

    const userName = isNull(user) ? null : user?.username;

    return (
        <AuthenticationButton userName={userName} state={sessionType} onClick={changeSessionType} />
    );
});
