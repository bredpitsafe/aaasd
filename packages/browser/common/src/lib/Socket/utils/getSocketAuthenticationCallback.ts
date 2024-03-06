import { requestLoginEnvBox } from '../../../actors/actions';
import type { TContextRef } from '../../../di';
import { ModuleActor } from '../../../modules/actor';
import { ModuleAuthentication } from '../../../modules/authentication';
import { getNotificationsModule } from '../../../modules/notifications/dynamicModule';
import type { TAuthenticationPluginCallbacks } from '../../BFFSocket/plugins/AuthenticationPlugin';

export function getSocketAuthenticationCallback(ctx: TContextRef): TAuthenticationPluginCallbacks {
    const actor = ModuleActor(ctx);
    const { setAuthenticationSocketState } = ModuleAuthentication(ctx);

    return {
        setAuthenticationSocketState,
        onError: (envelope) => {
            if (envelope.error.kind === 'Auth') {
                requestLoginEnvBox.send(actor, undefined);
                return;
            }
            getNotificationsModule(ctx).then(
                (notifications) =>
                    notifications?.error({
                        message: 'Authentication failed',
                        description: envelope.error.description,
                    }),
            );
        },
    };
}
