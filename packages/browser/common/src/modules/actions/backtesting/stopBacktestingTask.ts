import type { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';

import { TContextRef } from '../../../di';
import { stopBacktestingTaskHandle } from '../../../handlers/backtesting/stopBacktestingTaskHandle';
import { ModuleMessages } from '../../../lib/messages';
import { SocketStreamError } from '../../../lib/SocketStream/SocketStreamError';
import { TBacktestingTask } from '../../../types/domain/backtestings';
import { TSocketURL } from '../../../types/domain/sockets';
import { tapError, tapOnce } from '../../../utils/Rx/tap';
import { ModuleCommunicationHandlers } from '../../communicationHandlers';
import { ModuleNotifications } from '../../notifications/module';

export function stopBacktestingTask(
    ctx: TContextRef,
    url: TSocketURL,
    id: TBacktestingTask['id'],
): Observable<unknown> {
    const { request } = ModuleCommunicationHandlers(ctx);
    const messages = ModuleMessages(ctx);
    const notifications = ModuleNotifications(ctx);

    const close = messages.loading('Stopping Backtesting Task...');

    return stopBacktestingTaskHandle(request, url, id).pipe(
        tapOnce(() => messages.success('Backtesting Task stopped')),
        tapError((err: SocketStreamError) =>
            notifications.error({
                traceId: err.traceId,
                message: `Failed on stopping Backtesting Task(${id})`,
                description: err.message,
            }),
        ),
        finalize(close),
    );
}
