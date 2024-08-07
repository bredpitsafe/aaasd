import { tapError } from '@common/rx';
import type { Milliseconds } from '@common/types';

import { SocketStreamError } from '../../../lib/SocketStream/SocketStreamError';
import type { IModuleNotifications } from '../../notifications/def';

export function notifyErrorOperator(notification: IModuleNotifications) {
    return tapError((err) => {
        if (err instanceof SocketStreamError) {
            return notification.error({
                traceId: err.traceId,
                message: err.message,
                description: err.description,
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
