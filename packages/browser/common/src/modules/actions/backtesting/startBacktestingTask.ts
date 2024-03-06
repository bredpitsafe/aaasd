import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { TContextRef } from '../../../di';
import { startBacktestingTaskHandle } from '../../../handlers/backtesting/startBacktestingTaskHandle';
import { ModuleMessages } from '../../../lib/messages';
import { SocketStreamError } from '../../../lib/SocketStream/SocketStreamError';
import { TSocketURL } from '../../../types/domain/sockets';
import { tapError, tapOnce } from '../../../utils/Rx/tap';
import { ModuleCommunicationHandlers } from '../../communicationHandlers';
import { ModuleNotifications } from '../../notifications/module';

export function startBacktestingTask(
    ctx: TContextRef,
    url: TSocketURL,
    id: number,
    startStopped = false,
): Observable<unknown> {
    const { loading } = ModuleMessages(ctx);
    const { error } = ModuleNotifications(ctx);
    const { update } = ModuleCommunicationHandlers(ctx);

    const closeStartInfo = loading('Backtesting task starting...');

    return startBacktestingTaskHandle(update, url, id, startStopped).pipe(
        map((envelope) => envelope.payload),
        tapOnce(closeStartInfo),
        tapError((err: SocketStreamError) => {
            error({
                message: `Backtesting task starting failed`,
                description: err.message,
                traceId: err.traceId,
            });
        }),
    );
}
