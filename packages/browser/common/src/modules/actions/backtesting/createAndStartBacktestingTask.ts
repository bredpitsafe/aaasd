import type { Observable } from 'rxjs';
import { finalize, map } from 'rxjs/operators';

import type { TContextRef } from '../../../di';
import { createAndStartBacktestingTaskHandle } from '../../../handlers/backtesting/createAndStartBacktestingTaskHandle';
import type { SocketStreamError } from '../../../lib/SocketStream/SocketStreamError';
import type {
    TBacktestingTask,
    TBacktestingTaskCreateParams,
    TValidationTemplateErrors,
} from '../../../types/domain/backtestings';
import type { TSocketURL } from '../../../types/domain/sockets';
import { EMPTY_ARRAY } from '../../../utils/const';
import { tapError, tapOnce } from '../../../utils/Rx/tap';
import { throwingError } from '../../../utils/throwingError';
import type { TraceId } from '../../../utils/traceId';
import { logger } from '../../../utils/Tracing';
import { ModuleCommunicationHandlers } from '../../communicationHandlers';
import { ModuleMessages } from '../../messages';
import { ModuleNotifications } from '../../notifications/module';

export function createAndStartBacktestingTask(
    ctx: TContextRef,
    url: TSocketURL,
    task: TBacktestingTaskCreateParams,
    traceId: TraceId,
): Observable<TBacktestingTask['id'] | TValidationTemplateErrors[]> {
    const { error } = ModuleNotifications(ctx);
    const { loading, success, error: lightError } = ModuleMessages(ctx);
    const { update } = ModuleCommunicationHandlers(ctx);

    const closeMsg = loading('Creating Backtesting Task...');

    return createAndStartBacktestingTaskHandle(update, url, task, { traceId }).pipe(
        tapOnce((envelope) => {
            switch (envelope.payload.type) {
                case 'BacktestTaskStarted':
                    void success('Backtesting Task created successfully');
                    return;
                case 'ValidateBacktestTaskResult':
                    void lightError('Backtesting Task creation failed');
                    return;
            }
        }),
        map((envelope) => {
            switch (envelope.payload.type) {
                case 'BacktestTaskStarted':
                case 'ValidateBacktestTaskResult':
                    return envelope;
                default:
                    return throwingError('Backtesting Task has validation errors');
            }
        }),
        tapError((err: SocketStreamError) => {
            const message = 'Backtesting Task creation failed';

            logger.error(`[createAndStartBacktestingTask]: ${message}`, { traceId: err.traceId });

            error({
                message,
                description: err.message,
                traceId: err.traceId,
            });
        }),
        map((envelope) => {
            if (envelope.payload.type === 'ValidateBacktestTaskResult') {
                return envelope.payload.errors ?? EMPTY_ARRAY;
            }

            return envelope.payload.id;
        }),
        finalize(() => closeMsg()),
    );
}
