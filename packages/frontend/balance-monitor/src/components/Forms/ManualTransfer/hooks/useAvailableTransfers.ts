import type {
    TCoinId,
    TFullInfoByCoin,
    TTransfer,
} from '@frontend/common/src/types/domain/balanceMonitor/defs';
import { isNil } from 'lodash-es';
import { useMemo } from 'react';

import type { TManualTransferFormProps } from '../defs';

export function useAvailableTransfers(
    values: Partial<TManualTransferFormProps>,
    coinInfo: ReadonlyMap<TCoinId, TFullInfoByCoin>,
): TTransfer[] {
    return useMemo(
        () =>
            isNil(values.coin)
                ? []
                : coinInfo
                      .get(values.coin)
                      ?.graph.possibleTransfers.filter(({ isManualEnabled }) => isManualEnabled) ??
                  [],
        [coinInfo, values.coin],
    );
}
