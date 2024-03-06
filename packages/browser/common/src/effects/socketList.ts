import { Observable, timeout } from 'rxjs';
import { map, tap } from 'rxjs/operators';

import { TContextRef } from '../di';
import { ModuleSocketList } from '../modules/socketList';
import type { TSocketMap, TSocketName, TSocketURL } from '../types/domain/sockets';
import { getPathToRoot } from '../utils/getPathToRoot';
import { progressiveRetry } from '../utils/Rx/progressiveRetry';
import { tapError } from '../utils/Rx/tap';
import { logger } from '../utils/Tracing';
import { Binding } from '../utils/Tracing/Children/Binding';
import { getValidSocketUrl } from '../utils/url';

export function initSocketListEffects(ctx: TContextRef) {
    const { setSockets } = ModuleSocketList(ctx);

    loadConfig('urls.json').subscribe(setSockets);
}

const TIMEOUT = 5_000;
const loadConfigLogger = logger.child(new Binding('LoadConfig'));
export function loadConfig(fileName: string) {
    return new Observable<Record<string, string>>((subscriber) => {
        loadConfigLogger.info(`Loading sockets configuration`, { fileName });
        fetch(getPathToRoot() + `/configs/${fileName}`)
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
}
