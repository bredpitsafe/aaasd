import type { TCoinId } from '@frontend/common/src/types/domain/balanceMonitor/defs';
import type { TFullInfoByCoin } from '@frontend/common/src/types/domain/balanceMonitor/defs';
import { useFunction } from '@frontend/common/src/utils/React/useFunction';
import { isNil } from 'lodash-es';

export function useCoinValidation(
    coinInfo: ReadonlyMap<TCoinId, TFullInfoByCoin>,
): (coin: string | undefined) => boolean {
    return useFunction((coin: string | undefined) => isNil(coin) || coinInfo.has(coin as TCoinId));
}
