import type { Observable } from 'rxjs';
import { filter, map, startWith, switchMap } from 'rxjs/operators';

import { TContextRef } from '../../../di';
import {
    getConfigRevisionHandle,
    TConfigRevision,
} from '../../../handlers/getConfigRevisionHandle';
import { TComponentId } from '../../../types/domain/component';
import { TSocketURL } from '../../../types/domain/sockets';
import { tapError } from '../../../utils/Rx/tap';
import { ModuleCommunication } from '../../communication';
import { ModuleMessages } from '../../messages';

export function getConfigRevision(
    ctx: TContextRef,
    id: TComponentId,
    digest: string,
): Observable<TConfigRevision | undefined> {
    const { request, currentSocketUrl$ } = ModuleCommunication(ctx);
    const { error } = ModuleMessages(ctx);

    return currentSocketUrl$.pipe(
        filter((url): url is TSocketURL => url !== undefined),
        switchMap((url) =>
            getConfigRevisionHandle(request, url, id, digest).pipe(
                map(({ payload }) => payload.revisions[0]),
                startWith(undefined),
                tapError(() =>
                    error(`Could not load config revision ${digest} for component #${id}!`),
                ),
            ),
        ),
    );
}
