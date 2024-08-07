import { generateTraceId } from '@common/utils';
import { isNull } from 'lodash-es';
import { memo } from 'react';

import { ESessionTypes } from '../../actors/Session/domain.ts';
import { useModule } from '../../di/react.tsx';
import { useSession } from '../../hooks/session/useSession.ts';
import { useSessionUser } from '../../hooks/session/useSessionUser.ts';
import { ModuleSessionLogout } from '../../modules/session';
import { useFunction } from '../../utils/React/useFunction';
import { useNotifiedObservableFunction } from '../../utils/React/useObservableFunction.ts';
import { AuthenticationButton } from '../AuthenticationButton/AuthenticationButton';

export const ConnectedAuthenticationButton = memo(() => {
    const [logout] = useNotifiedObservableFunction(useModule(ModuleSessionLogout));

    const user = useSessionUser();
    const session = useSession();
    const sessionType = session?.type;

    const changeSessionType = useFunction(() => {
        if (sessionType === ESessionTypes.Auth) {
            void logout({ name: undefined }, { traceId: generateTraceId() });
        }
    });

    if (sessionType === undefined) return null;

    const userName = isNull(user) ? null : user?.username;

    return (
        <AuthenticationButton userName={userName} state={sessionType} onClick={changeSessionType} />
    );
});
