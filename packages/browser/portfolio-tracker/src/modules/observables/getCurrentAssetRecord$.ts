import { SHARE_RESET_DELAY } from '@frontend/common/src/defs/observables';
import { TContextRef } from '@frontend/common/src/di';
import { ModuleDictionaries } from '@frontend/common/src/modules/dictionaries';
import { TAsset, TAssetId } from '@frontend/common/src/types/domain/asset';
import { TSocketURL } from '@frontend/common/src/types/domain/sockets';
import { shareReplayWithDelayedReset } from '@frontend/common/src/utils/Rx/share';
import { generateTraceId } from '@frontend/common/src/utils/traceId';
import { concat, EMPTY, Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

export function getCurrentAssetRecord$(
    ctx: TContextRef,
    currentSocketUrl$: Observable<undefined | TSocketURL>,
): Observable<undefined | Record<TAssetId, TAsset>> {
    const { getAssets$ } = ModuleDictionaries(ctx);

    return currentSocketUrl$.pipe(
        switchMap((url) =>
            concat(of(undefined), url === undefined ? EMPTY : getAssets$(url, generateTraceId())),
        ),
        map((assets) => {
            if (assets === undefined) return undefined;
            return assets.reduce(
                (acc, asset) => {
                    acc[asset.id] = asset;
                    return acc;
                },
                {} as Record<TAssetId, TAsset>,
            );
        }),
        shareReplayWithDelayedReset(SHARE_RESET_DELAY),
    );
}
