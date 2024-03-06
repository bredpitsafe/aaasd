import type { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';

import { TContextRef } from '../../../di';
import { pauseBacktestingRunHandle } from '../../../handlers/backtesting/pauseBacktestingRunHandle';
import { TReceivedData } from '../../../lib/BFFSocket/def';
import { ModuleMessages } from '../../../lib/messages';
import { SocketStreamError } from '../../../lib/SocketStream/SocketStreamError';
import { TBacktestingRun } from '../../../types/domain/backtestings';
import { TSocketURL } from '../../../types/domain/sockets';
import { tapError, tapOnce } from '../../../utils/Rx/tap';
import { ModuleCommunicationHandlers } from '../../communicationHandlers';
import { ModuleNotifications } from '../../notifications/module';

export function pauseBacktestingRun(
    ctx: TContextRef,
    url: TSocketURL,
    id: TBacktestingRun['btRunNo'],
): Observable<TReceivedData<unknown>> {
    const { request } = ModuleCommunicationHandlers(ctx);
    const messages = ModuleMessages(ctx);
    const notifications = ModuleNotifications(ctx);

    const close = messages.loading('Pausing Backtesting Run...');

    return pauseBacktestingRunHandle(request, url, id).pipe(
        tapOnce(() => messages.success('Backtesting Run paused')),
        tapError((err: SocketStreamError) =>
            notifications.error({
                traceId: err.traceId,
                message: `Failed on pausing Backtesting Run(${id})`,
                description: err.message,
            }),
        ),
        finalize(close),
    );
}
