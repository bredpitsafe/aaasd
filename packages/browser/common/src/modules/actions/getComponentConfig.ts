import type { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { TContextRef } from '../../di';
import type { TComponentConfig } from '../../handlers/def';
import { getComponentConfigHandle } from '../../handlers/getComponentConfigHandle';
import type { SocketStreamError } from '../../lib/SocketStream/SocketStreamError';
import type { TBacktestingRun } from '../../types/domain/backtestings';
import type { TComponentId } from '../../types/domain/component';
import type { TSocketURL } from '../../types/domain/sockets';
import { tapError } from '../../utils/Rx/tap';
import type { TraceId } from '../../utils/traceId';
import type { TFetchHandler } from '../communicationHandlers/def';
import { ModuleNotifications } from '../notifications/module';

export function getComponentConfig<TId extends TComponentId>(
    ctx: TContextRef,
    request: TFetchHandler,
    url: TSocketURL,
    componentId: TId,
    btRunNo: TBacktestingRun['btRunNo'],
    traceId: TraceId,
): Observable<TComponentConfig | undefined> {
    const { error } = ModuleNotifications(ctx);

    return getComponentConfigHandle(request, url, componentId, btRunNo, { traceId }).pipe(
        tapError((err: SocketStreamError): void => {
            error({
                message: `Error loading component config`,
                description: err.message,
                traceId: err.traceId,
            });
        }),
        map((envelope) => envelope.payload ?? undefined),
    );
}
