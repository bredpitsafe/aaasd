import type { Observable } from 'rxjs';
import { finalize, map } from 'rxjs/operators';

import type { TContextRef } from '../../../di';
import {
    TUpdateBacktestingTaskParams,
    updateBacktestingTaskHandle,
} from '../../../handlers/backtesting/updateBacktestingTaskHandle';
import { ModuleMessages } from '../../../lib/messages';
import type { SocketStreamError } from '../../../lib/SocketStream/SocketStreamError';
import type { TSocketURL } from '../../../types/domain/sockets';
import { tapError, tapOnce } from '../../../utils/Rx/tap';
import type { TraceId } from '../../../utils/traceId';
import { logger } from '../../../utils/Tracing';
import { ModuleCommunicationHandlers } from '../../communicationHandlers';
import { ModuleNotifications } from '../../notifications/module';

export function updateBacktestingTask(
    ctx: TContextRef,
    url: TSocketURL,
    params: TUpdateBacktestingTaskParams,
    traceId: TraceId,
): Observable<unknown> {
    const { loading, success } = ModuleMessages(ctx);
    const { error } = ModuleNotifications(ctx);
    const { update } = ModuleCommunicationHandlers(ctx);

    const close = loading('Backtesting task updating...');

    const { id, name, description, scoreIndicator } = params;
    return updateBacktestingTaskHandle(
        update,
        url,
        { id, name, description, scoreIndicator },
        { traceId },
    ).pipe(
        map((envelope) => envelope.payload),
        tapOnce(() => success(`Task #${id} updated`)),
        tapError((err: SocketStreamError) => {
            logger.error(`[updateBacktestingTask] Backtesting task update failed`, {
                traceId: err.traceId,
            });
            error({
                message: `Backtesting task update failed`,
                description: err.message,
                traceId: err.traceId,
            });
        }),
        finalize(close),
    );
}
