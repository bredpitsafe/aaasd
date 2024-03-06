import { catchError, distinctUntilChanged, EMPTY, switchMap, timeout } from 'rxjs';

import { sendHeartbeatEnvBox, WORKER_HEARTBEAT_INTERVAL } from '../../actors/Heartbeat/actions';
import { TContextRef } from '../../di';
import { ModuleActor } from '../../modules/actor';
import { isDevelopment } from '../../utils/environment';
import { documentVisibilityState$ } from '../../utils/observable/documentVisibilityState';
import { progressiveRetry } from '../../utils/Rx/progressiveRetry';
import { tapOnce } from '../../utils/Rx/tap';
import { logger } from '../../utils/Tracing';
import { Binding } from '../../utils/Tracing/Children/Binding';
import { dataSourceSetter } from './dataSource';

export function initWorkerEffects(ctx: TContextRef) {
    watchWorkerHealth(ctx);
}

const FIRST_MISSED_HEARTBEATS_ERROR_THRESHOLD = 30;
const MISSED_HEARTBEATS_ERROR_THRESHOLD = 20;
const watchWorkerHealth = (ctx: TContextRef) => {
    // Do not enable worker health check in development mode
    // since it throws false positives when using debugger.
    if (isDevelopment()) {
        return;
    }

    const actor = ModuleActor(ctx);
    const dataSource = dataSourceSetter(ctx);

    const log = logger.child(new Binding('WorkerHealthCheck'));

    log.info('worker registered');
    dataSource.register();

    // Only run health check when the tab is focused.
    // This is due to possible false positives when JS is throttled in the inactive tab.
    documentVisibilityState$
        .pipe(
            distinctUntilChanged(),
            switchMap((active) => {
                log.info(`active page state: ${active}`);
                dataSource.unknown();

                return active
                    ? sendHeartbeatEnvBox.requestStream(actor, undefined).pipe(
                          tapOnce(() => {
                              log.info('worker first heartbeat received');
                              dataSource.stable();
                          }),
                          timeout({
                              // Due to delayed worker initialization by the browser
                              // Receiving first heartbeat might be slower than consecutive ones.
                              first:
                                  WORKER_HEARTBEAT_INTERVAL *
                                  FIRST_MISSED_HEARTBEATS_ERROR_THRESHOLD,
                              each: WORKER_HEARTBEAT_INTERVAL * MISSED_HEARTBEATS_ERROR_THRESHOLD,
                          }),
                          catchError((_, caught) => {
                              log.error(
                                  `worker is considered dead due to ${MISSED_HEARTBEATS_ERROR_THRESHOLD} missing heartbeats`,
                              );
                              dataSource.error();

                              return caught;
                          }),
                          progressiveRetry(),
                      )
                    : EMPTY;
            }),
        )
        .subscribe();
};
