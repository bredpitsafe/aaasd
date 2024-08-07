import type { Socket } from '@frontend/common/src/lib/Socket/Socket';
import { logger } from '@frontend/common/src/utils/Tracing';
import { finalize } from 'rxjs';

export const releaseSocket = (socket: Socket) => {
    return finalize(() => {
        socket.destroy();
        logger.info('[Socket] Socket closed and destroyed');
    });
};
