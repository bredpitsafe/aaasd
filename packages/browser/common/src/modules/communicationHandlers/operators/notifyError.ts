import { SocketStreamError } from '../../../lib/SocketStream/SocketStreamError';
import { tapError } from '../../../utils/Rx/tap';
import type { IModuleNotifications } from '../../notifications/def';

export function notifyErrorOperator(notification: IModuleNotifications) {
    return tapError<SocketStreamError>((err) => {
        notification.error({
            traceId: err.traceId,
            message: err.message,
            description: err.getDescription(),
        });
    });
}
