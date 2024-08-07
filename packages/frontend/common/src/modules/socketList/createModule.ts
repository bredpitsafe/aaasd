import { isEmpty } from 'lodash-es';
import type { Observable } from 'rxjs';
import { distinctUntilChanged } from 'rxjs';
import { filter, map, shareReplay } from 'rxjs/operators';

import type { TSocketMap, TSocketName, TSocketURL } from '../../types/domain/sockets';
import { createObservableBox } from '../../utils/rx';
import { throwingError } from '../../utils/throwingError';
import { getValidSocketUrl } from '../../utils/url.ts';
import { SOCKET_STAR_NAME, SOCKET_STAR_URL } from './defs.ts';

export function createModule() {
    const boxSockets = createObservableBox<undefined | TSocketMap>(undefined);

    const filledSocketNames$ = boxSockets.obs.pipe(
        filter((v): v is TSocketMap => v !== undefined),
        shareReplay(1),
    );

    const socketNames$ = filledSocketNames$.pipe(
        map((m) => Object.keys(m) as TSocketName[]),
        shareReplay(1),
    );

    const socketURLs$ = filledSocketNames$.pipe(
        map((m) => Object.values(m)),
        shareReplay(1),
    );

    return {
        sockets$: boxSockets.obs,
        socketNames$,
        socketURLs$,

        getSockets: boxSockets.get,
        setSockets: boxSockets.set,

        getSocket: (name: TSocketName): undefined | TSocketURL => boxSockets.get()?.[name],
        getSocket$: (name: TSocketName): Observable<TSocketURL> =>
            filledSocketNames$.pipe(
                map((map) => {
                    if (isEmpty(name)) {
                        throwingError('Server name is not set');
                    }

                    if (name === SOCKET_STAR_NAME) {
                        return getValidSocketUrl(SOCKET_STAR_URL);
                    }

                    if (!(name in map)) {
                        throwingError(`Server '${name}' is missing in servers config`);
                    }

                    return map[name];
                }),
                distinctUntilChanged(),
            ),
    };
}
