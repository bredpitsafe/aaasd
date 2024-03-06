import type { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';

import { TContextRef } from '../../../di';
import { resumeBacktestingRunHandle } from '../../../handlers/backtesting/resumeBacktestingRunHandle';
import { TReceivedData } from '../../../lib/BFFSocket/def';
import { ModuleMessages } from '../../../lib/messages';
import { SocketStreamError } from '../../../lib/SocketStream/SocketStreamError';
import { TBacktestingRun } from '../../../types/domain/backtestings';
import { TSocketURL } from '../../../types/domain/sockets';
import { tapError, tapOnce } from '../../../utils/Rx/tap';
import { ModuleCommunicationHandlers } from '../../communicationHandlers';
import { ModuleNotifications } from '../../notifications/module';

export function resumeBacktestingRun(
    ctx: TContextRef,
    url: TSocketURL,
    id: TBacktestingRun['btRunNo'],
): Observable<TReceivedData<unknown>> {
    const { request } = ModuleCommunicationHandlers(ctx);
    const messages = ModuleMessages(ctx);
    const notifications = ModuleNotifications(ctx);

    const close = messages.loading('Resuming Backtesting Run...');

    return resumeBacktestingRunHandle(request, url, id).pipe(
        tapOnce(() => messages.success('Backtesting Run resumed')),
        tapError((err: SocketStreamError) =>
            notifications.error({
                traceId: err.traceId,
                message: `Failed on resuming Backtesting Run(${id})`,
                description: err.message,
            }),
        ),
        finalize(close),
    );
}
