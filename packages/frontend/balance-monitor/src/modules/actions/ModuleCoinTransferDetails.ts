import type { TContextRef } from '@frontend/common/src/di';
import { ModuleFactory } from '@frontend/common/src/di';
import { ModuleSocketPage } from '@frontend/common/src/modules/socketPage';
import type {
    TCoinId,
    TCoinTransferDetailsItem,
} from '@frontend/common/src/types/domain/balanceMonitor/defs.ts';
import type { TSocketURL } from '@frontend/common/src/types/domain/sockets.ts';
import { dedobs } from '@frontend/common/src/utils/observable/memo.ts';
import { createObservableBox } from '@frontend/common/src/utils/rx.ts';
import { mapValueDescriptor } from '@frontend/common/src/utils/Rx/ValueDescriptor2.ts';
import { shallowHash } from '@frontend/common/src/utils/shallowHash.ts';
import type { TValueDescriptor2 } from '@frontend/common/src/utils/ValueDescriptor/types.ts';
import { createSyncedValueDescriptor } from '@frontend/common/src/utils/ValueDescriptor/utils.ts';
import type { Observable } from 'rxjs';
import { filter, map, startWith, switchMap } from 'rxjs/operators';

import { ModuleRequestCoinTransferDetails } from './ModuleRequestCoinTransferDetails.ts';

export type TCoinTransferDetailsDescriptor = TValueDescriptor2<TCoinTransferDetailsItem[]>;

export const ModuleCoinTransferDetails = ModuleFactory((ctx: TContextRef) => {
    const requestCoinTransferDetails = ModuleRequestCoinTransferDetails(ctx);
    const { currentSocketUrl$ } = ModuleSocketPage(ctx);

    const refreshCoinTransferDetailsBox = createObservableBox<TCoinId | undefined>(undefined);

    const getCoinTransferDetails$ = dedobs(
        (coin: TCoinId, options): Observable<TCoinTransferDetailsDescriptor> => {
            return currentSocketUrl$.pipe(
                filter((url): url is TSocketURL => url !== undefined),
                switchMap((url) =>
                    refreshCoinTransferDetailsBox.obs.pipe(
                        startWith(coin),
                        filter((refreshCoin): refreshCoin is TCoinId => refreshCoin === coin),
                        map(() => url),
                    ),
                ),
                switchMap((target) =>
                    requestCoinTransferDetails(
                        { target, coin },
                        { ...options, skipAuthentication: false },
                    ).pipe(
                        mapValueDescriptor(({ value }) =>
                            createSyncedValueDescriptor(value.details),
                        ),
                    ),
                ),
            );
        },
        {
            normalize: ([coin]) => {
                return shallowHash(coin);
            },
            resetDelay: 0,
            removeDelay: 0,
        },
    );

    return {
        refreshCoinTransferDetails(coin: TCoinId): void {
            refreshCoinTransferDetailsBox.set(coin);
        },
        getCoinTransferDetails$,
    };
});
