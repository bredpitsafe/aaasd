import { isNil } from 'lodash-es';
import { concat, EMPTY, Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import { TContextRef } from '../../../di';
import { TAsset } from '../../../types/domain/asset';
import { Minutes } from '../../../types/time';
import { dedobs } from '../../../utils/observable/memo';
import { shareReplayWithDelayedReset } from '../../../utils/Rx/share';
import { minutes2milliseconds } from '../../../utils/time';
import { generateTraceId } from '../../../utils/traceId';
import { ModuleDictionaries } from '../../dictionaries';
import { ModuleSocketPage } from '../../socketPage';

export const getSocketAssetsDedobsed$ = dedobs(
    (ctx: TContextRef): Observable<TAsset[] | undefined> => {
        const { currentSocketUrl$ } = ModuleSocketPage(ctx);
        const { getAssets$ } = ModuleDictionaries(ctx);
        const traceId = generateTraceId();

        return currentSocketUrl$.pipe(
            switchMap((url) =>
                isNil(url) ? EMPTY : concat(of(undefined), getAssets$(url, traceId)),
            ),
            shareReplayWithDelayedReset(minutes2milliseconds(5 as Minutes)),
        );
    },
    {
        removeDelay: minutes2milliseconds(5 as Minutes),
    },
);
