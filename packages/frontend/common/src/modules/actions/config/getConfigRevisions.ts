import type { Observable } from 'rxjs';
import { first } from 'rxjs';
import { map, startWith, switchMap } from 'rxjs/operators';

import { TContextRef } from '../../../di';
import { EFetchHistoryDirection } from '../../../handlers/def';
import {
    getConfigRevisionsHandle,
    TConfigRevisionLookup,
} from '../../../handlers/getConfigRevisionsHandle';
import { TComponentId } from '../../../types/domain/component';
import { TSocketURL } from '../../../types/domain/sockets';
import { tapError } from '../../../utils/Rx/tap';
import { getNowNanoseconds } from '../../../utils/time';
import { ModuleCommunication } from '../../communication';
import { ModuleMessages } from '../../messages';

const CONFIG_REVISIONS_LIMIT = 500;
export function getConfigRevisions(
    ctx: TContextRef,
    id: TComponentId,
): Observable<TConfigRevisionLookup[] | undefined> {
    const { request, currentSocketUrl$ } = ModuleCommunication(ctx);
    const { error } = ModuleMessages(ctx);

    return currentSocketUrl$.pipe(
        first((url): url is TSocketURL => url !== undefined),
        switchMap((url) =>
            getConfigRevisionsHandle(request, url, id, {
                direction: EFetchHistoryDirection.Backward,
                platformTime: getNowNanoseconds(),
                limit: CONFIG_REVISIONS_LIMIT,
            }).pipe(
                map(({ payload }) => payload.revisions),
                startWith(undefined),
                tapError(() => error(`Could not load config revisions for component #${id}!`)),
            ),
        ),
    );
}
