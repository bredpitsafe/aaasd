import type { TContextRef } from '../../../di';
import { getNotificationsModule } from '../../../modules/notifications/dynamicModule';
import type { TReconnectOnCloseOptions } from '../../BFFSocket/plugins/ReconnectOnClose';
import type { Socket } from '../Socket';

export function getReconnectPluginCallbacks(
    ctx: TContextRef,
): Pick<
    TReconnectOnCloseOptions,
    'onReconnectStart' | 'onReconnectTry' | 'onReconnectSuccess' | 'onReconnectFail'
> {
    return {
        onReconnectSuccess(socket: Socket) {
            getNotificationsModule(ctx).then(
                (notifications) =>
                    notifications?.success({
                        message: 'Successful socket reconnect!',
                        description: `Socket url ${socket.url}`,
                    }),
            );
        },

        onReconnectFail(socket: Socket) {
            getNotificationsModule(ctx).then(
                (notifications) =>
                    notifications?.error({
                        message: 'Unsuccessful socket reconnect!',
                        description: `Socket ${socket.url} couldn't be opened`,
                    }),
            );
        },
    };
}
