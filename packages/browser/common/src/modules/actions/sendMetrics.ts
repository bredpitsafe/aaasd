import { first } from 'rxjs';

import { TContextRef } from '../../di';
import { sendMetricsHandle, TMetric } from '../../handlers/sendMetricsHandle';
import { ModuleCommunicationHandlers } from '../communicationHandlers';
import { ModuleCommunicationHandlersRemoted } from '../communicationRemoteHandlers';
import { ModuleSocketList } from '../socketList';
import { SOCKET_STAR_NAME } from '../socketList/defs';

export function sendMetrics(ctx: TContextRef, metrics: TMetric[], remotely = false) {
    const { getSocket$ } = ModuleSocketList(ctx);
    const { update } = remotely
        ? ModuleCommunicationHandlersRemoted(ctx)
        : ModuleCommunicationHandlers(ctx);

    getSocket$(SOCKET_STAR_NAME)
        .pipe(first((v) => v !== undefined))
        .subscribe((url) => sendMetricsHandle(update, url, metrics));
}
