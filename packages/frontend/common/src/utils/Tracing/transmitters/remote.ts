import { milliseconds2nanoseconds, toMilliseconds } from '@common/utils';
import type { Level } from 'pino';
import { asapScheduler, delayWhen, filter, from, observeOn, Subject } from 'rxjs';

import { ELogLevel } from '../../../modules/actions/logs/defs.ts';
import type { TLogEventData, TSendLog } from '../def';

type TRemoteTracePublisher = {
    pushTrace: (log: TLogEventData) => void;
};

const availableLevels = new Set(['fatal', 'error', 'warn', 'info', 'trace']);

export function createRemoteTracePublisher(
    sendLogPromise: Promise<TSendLog>,
): TRemoteTracePublisher {
    const publishLogs$ = new Subject<TLogEventData>();

    let sendLog: undefined | TSendLog;
    sendLogPromise.then((v) => (sendLog = v));

    publishLogs$
        .pipe(
            // log loop protection
            observeOn(asapScheduler),
            filter((log) => availableLevels.has(log.level)),
            delayWhen(() => from(sendLogPromise)),
        )
        .subscribe((log) => {
            const { level, message, timestamp, params, bindings, fingerprint } = log;
            sendLog!({
                level: transformLevel(level),
                clientTime: milliseconds2nanoseconds(toMilliseconds(timestamp)),
                message,
                params: {
                    params,
                    bindings,
                    fingerprint,
                },
            });
        });

    function pushTrace(log: TLogEventData) {
        publishLogs$.next(log);
    }

    return { pushTrace };
}

function transformLevel(level: Level): ELogLevel {
    switch (level) {
        case 'fatal':
        case 'error': {
            return ELogLevel.Error;
        }
        case 'warn': {
            return ELogLevel.Warn;
        }
        case 'info': {
            return ELogLevel.Info;
        }
        case 'debug':
        case 'trace': {
            return ELogLevel.Debug;
        }
    }
}
