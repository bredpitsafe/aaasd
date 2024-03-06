import type { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { TContextRef } from '../../../di';
import { validateBacktestingTaskHandle } from '../../../handlers/backtesting/validateBacktestingTaskHandle';
import type { SocketStreamError } from '../../../lib/SocketStream/SocketStreamError';
import type {
    TBacktestingTaskCreateParams,
    TValidationTemplateErrors,
} from '../../../types/domain/backtestings';
import type { TSocketURL } from '../../../types/domain/sockets';
import { EMPTY_ARRAY } from '../../../utils/const';
import { tapError } from '../../../utils/Rx/tap';
import type { TraceId } from '../../../utils/traceId';
import { logger } from '../../../utils/Tracing';
import { ModuleCommunicationHandlers } from '../../communicationHandlers';
import { ModuleNotifications } from '../../notifications/module';

export function validateBacktestingTask(
    ctx: TContextRef,
    url: TSocketURL,
    task: Omit<TBacktestingTaskCreateParams, 'simulationData'>,
    traceId: TraceId,
): Observable<TValidationTemplateErrors[]> {
    const { error } = ModuleNotifications(ctx);
    const { update } = ModuleCommunicationHandlers(ctx);

    return validateBacktestingTaskHandle(update, url, task, { traceId }).pipe(
        map((envelope) => envelope.payload.errors ?? EMPTY_ARRAY),
        tapError((err: SocketStreamError) => {
            const message = 'Backtesting task validation failed';

            logger.error(`[validateBacktestingTask]: ${message}`, { traceId: err.traceId });

            error({
                message,
                description: err.message,
                traceId: err.traceId,
            });
        }),
    );
}
