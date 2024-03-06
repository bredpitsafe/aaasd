import type { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';

import { TContextRef } from '../../../di';
import { deleteBacktestingTaskHandle } from '../../../handlers/backtesting/deleteBacktestingTaskHandle';
import { ModuleMessages } from '../../../lib/messages';
import type { SocketStreamError } from '../../../lib/SocketStream/SocketStreamError';
import type { TBacktestingTask } from '../../../types/domain/backtestings';
import type { TSocketURL } from '../../../types/domain/sockets';
import { tapError, tapOnce } from '../../../utils/Rx/tap';
import { ModuleCommunicationHandlers } from '../../communicationHandlers';
import { ModuleNotifications } from '../../notifications/module';

export function deleteBacktestingTask(
    ctx: TContextRef,
    url: TSocketURL,
    id: TBacktestingTask['id'],
): Observable<unknown> {
    const { request } = ModuleCommunicationHandlers(ctx);
    const messages = ModuleMessages(ctx);
    const notifications = ModuleNotifications(ctx);

    const close = messages.loading('Deleting Backtesting Task...');

    return deleteBacktestingTaskHandle(request, url, id).pipe(
        tapOnce(() => messages.success('Backtesting Task deleted')),
        tapError((err: SocketStreamError) =>
            notifications.error({
                traceId: err.traceId,
                message: `Failed to delete Backtesting Task(${id})`,
                description: err.message,
            }),
        ),
        finalize(close),
    );
}
