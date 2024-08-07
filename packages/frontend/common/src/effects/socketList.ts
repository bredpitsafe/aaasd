import { tapError } from '@common/rx';
import { Observable, timeout } from 'rxjs';
import { map, tap } from 'rxjs/operators';

import { DEDUPE_REMOVE_DELAY, SHARE_RESET_DELAY } from '../defs/observables.ts';
import type { TContextRef } from '../di';
import { ModuleSocketList } from '../modules/socketList';
import type { TSocketMap, TSocketName, TSocketURL } from '../types/domain/sockets';
import { APP_ROOT_PATH } from '../utils/getPathToRoot';
import { dedobs } from '../utils/observable/memo.ts';
import { progressiveRetry } from '../utils/Rx/progressiveRetry';
import { logger } from '../utils/Tracing';
import { Binding } from '../utils/Tracing/Children/Binding';
import { getValidSocketUrl } from '../utils/url';

export function initSocketListEffects(ctx: TContextRef) {
    const { setSockets } = ModuleSocketList(ctx);

    loadConfig('urls.json').subscribe(setSockets);
}

const TIMEOUT = 5_000;
const loadConfigLogger = logger.child(new Binding('LoadConfig'));
export const loadConfig = dedobs(
    (fileName: string) => {
        return new Observable<Record<string, string>>((subscriber) => {
            loadConfigLogger.info(`Loading sockets configuration`, { fileName });
            fetch(APP_ROOT_PATH + `/configs/${fileName}`)
                .then((v) => v.json())
                .then((v) => subscriber.next(v))
                .catch((e) => subscriber.error(e))
                .finally(() => subscriber.complete());
        }).pipe(
            timeout(TIMEOUT),
            tapError((error) => {
                loadConfigLogger.error(`Loading sockets configuration failed`, { fileName, error });
            }),
            progressiveRetry(),
            map((data) => Object.entries(data)),
            tap((data) =>
                loadConfigLogger.info(`Loading sockets configuration success`, {
                    fileName,
                    entries: data.length,
                }),
            ),
            map((data) =>
                data.reduce((acc, [key, value]) => {
                    acc[key as TSocketName] = getValidSocketUrl(value as TSocketURL);
                    return acc;
                }, {} as TSocketMap),
            ),
        );
    },
    {
        normalize: ([fileName]) => fileName,
        resetDelay: SHARE_RESET_DELAY,
        removeDelay: DEDUPE_REMOVE_DELAY,
    },
);
