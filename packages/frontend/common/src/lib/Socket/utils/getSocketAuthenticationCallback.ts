import { generateTraceId } from '@common/utils';
import { firstValueFrom, switchMap } from 'rxjs';

import type { TContextRef } from '../../../di';
import { getKeycloakDomainName } from '../../../utils/keycloak.ts';
import { extractSyncedValueFromValueDescriptor } from '../../../utils/Rx/ValueDescriptor2.ts';
import type { TAuthenticationPluginCallbacks } from '../../BFFSocket/plugins/AuthenticationPlugin';

export function getSocketAuthenticationCallback(ctx: TContextRef): TAuthenticationPluginCallbacks {
    // avoid circular dependency
    const { ModuleSessionLogin, ModuleSessionRelogin, ModuleSubscribeToSessionToken } =
        require('../../../modules/session') as typeof import('../../../modules/session');
    const login = ModuleSessionLogin(ctx);
    const relogin = ModuleSessionRelogin(ctx);
    const subscribeToSessionToken = ModuleSubscribeToSessionToken(ctx);

    return {
        subscribeToSessionToken: (socketName) => {
            const options = { traceId: generateTraceId() };
            const domainName = getKeycloakDomainName(socketName);

            return login({ name: domainName }, options).pipe(
                switchMap(() =>
                    subscribeToSessionToken({ name: domainName }, { traceId: generateTraceId() }),
                ),
                extractSyncedValueFromValueDescriptor(),
            );
        },
        onError: (socketName) => {
            const domainName = getKeycloakDomainName(socketName);
            return firstValueFrom(relogin({ name: domainName }, { traceId: generateTraceId() }));
        },
    };
}
