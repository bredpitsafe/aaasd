import type {
    TCoinId,
    TFullInfoByCoin,
} from '@frontend/common/src/types/domain/balanceMonitor/defs';
import { useMemo } from 'react';

import { CoinWithIcon } from '../CoinWithIcon';

export function useCoinOptions(coinInfo: ReadonlyMap<TCoinId, TFullInfoByCoin>) {
    return useMemo(
        () =>
            (Array.from(coinInfo.keys()) as TCoinId[]).sort().map((coin) => ({
                label: <CoinWithIcon coin={coin} />,
                value: coin,
            })),
        [coinInfo],
    );
}
