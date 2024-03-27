import { SocketStreamError } from '@frontend/common/src/lib/SocketStream/SocketStreamError';
import { isEmpty } from 'lodash-es';

export function getNotificationError(
    message: string,
    error: Error | SocketStreamError,
): { message: string; description: string } {
    const description = error instanceof SocketStreamError ? error.getDescription() : undefined;

    return {
        message,
        description: isEmpty(description) ? error.message : `${error.message}\n${description}`,
    };
}
