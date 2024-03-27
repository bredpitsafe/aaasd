import { SocketStreamError } from '../../../lib/SocketStream/SocketStreamError';
import { Milliseconds } from '../../../types/time.ts';
import { tapError } from '../../../utils/Rx/tap';
import type { IModuleNotifications } from '../../notifications/def';

export function notifyErrorOperator(notification: IModuleNotifications) {
    return tapError((err) => {
        if (err instanceof SocketStreamError) {
            return notification.error({
                traceId: err.traceId,
                message: err.message,
                description: err.getDescription(),
                timestamp: err.timestamp as Milliseconds,
                socketURL: err.socketURL,
            });
        }
        return notification.error({
            message: err.message,
            description: err.stack,
        });
    });
}
