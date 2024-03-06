import { Observable } from 'rxjs';
import { map, share } from 'rxjs/operators';

import { DEDUPE_REMOVE_DELAY } from '../../../defs/observables';
import type { TContextRef } from '../../../di';
import { EMPTY_OBJECT } from '../../../utils/const';
import { isRealtimeChunkRequest } from '../../../utils/domain/chunks';
import { dedobs } from '../../../utils/observable/memo';
import { shareReplayWithDelayedReset } from '../../../utils/Rx/share';
import { semanticHash } from '../../../utils/semanticHash';
import { POINTS_SHARE_RESET_DELAY, TGetChartPointsProps, TGetChartPointsReturnType } from './defs';
import { getPointsCoords } from './getPointsCoords';
import { getChartPartPoints } from './utils';

export const getChartPoints = dedobs(
    (ctx: TContextRef, props: TGetChartPointsProps): Observable<TGetChartPointsReturnType> => {
        return getPointsCoords(ctx, props).pipe(
            map((pointCoords) => getChartPartPoints(pointCoords, props)),
            isRealtimeChunkRequest(props)
                ? share()
                : shareReplayWithDelayedReset(POINTS_SHARE_RESET_DELAY, Infinity),
        );
    },
    {
        normalize: ([, props]) => semanticHash.get(props, EMPTY_OBJECT),
        removeDelay: DEDUPE_REMOVE_DELAY,
    },
);
