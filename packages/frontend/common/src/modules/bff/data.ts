import { isNil } from 'lodash-es';
import { map, Observable, shareReplay, switchMap } from 'rxjs';

import { loadConfig } from '../../effects/socketList.ts';
import { TSocketName, TSocketStruct } from '../../types/domain/sockets.ts';

export const BFF_PROD_SOCKET_NAME = 'bff-prod' as TSocketName;
export const bffSocketsList$ = loadConfig('bff.urls.json').pipe(shareReplay(1));

export const getCurrentBffSocket$ = (
    currentSocket$: Observable<TSocketName | undefined>,
): Observable<TSocketStruct> =>
    currentSocket$.pipe(
        switchMap((currentSocketName) => {
            return bffSocketsList$.pipe(
                map((list) => {
                    if (!isNil(currentSocketName) && currentSocketName in list) {
                        return { name: currentSocketName, url: list[currentSocketName] };
                    }
                    return { name: BFF_PROD_SOCKET_NAME, url: list[BFF_PROD_SOCKET_NAME] };
                }),
            );
        }),
    );
