import { EMPTY, switchMap, timeout } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

import { publishHeartbeatEnvBox } from '../../actors/Heartbeat/actions.ts';
import { WORKER_HEARTBEAT_INTERVAL } from '../../actors/Heartbeat/def.ts';
import { TContextRef } from '../../di';
import { ModuleActor } from '../../modules/actor';
import { isDevelopment } from '../../utils/environment.ts';
import { documentVisibilityState$ } from '../../utils/observable/documentVisibilityState';
import { progressiveRetry } from '../../utils/Rx/progressiveRetry';
import { tapError, tapOnce } from '../../utils/Rx/tap';
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

    const log = logger.child(new Binding('WorkerHealthCheck'));
    const actor = ModuleActor(ctx);
    const dataSource = dataSourceSetter(ctx);

    log.info('worker registered');
    dataSource.register();

    // Only run health check when the tab is focused.
    // This is due to possible false positives when JS is throttled in the inactive tab.
    documentVisibilityState$
        .pipe(
            debounceTime(1000),
            distinctUntilChanged(),
            switchMap((active) => {
                log.info(`active page state: ${active}`);
                dataSource.unknown();

                return active
                    ? publishHeartbeatEnvBox.as$(actor).pipe(
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
                          tapError(() => {
                              log.error(
                                  `worker is considered dead due to ${MISSED_HEARTBEATS_ERROR_THRESHOLD} missing heartbeats`,
                              );
                              dataSource.error();
                          }),
                          progressiveRetry(),
                      )
                    : EMPTY;
            }),
        )
        .subscribe();
};
