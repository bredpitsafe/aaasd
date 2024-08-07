import type { TTransfer } from '@frontend/common/src/types/domain/balanceMonitor/defs';
import { useMemo } from 'react';

import type { TManualTransferFormProps } from '../defs';

export function useCurrentTransfer(
    transfers: TTransfer[],
    values: Partial<TManualTransferFormProps>,
) {
    return useMemo(
        () =>
            transfers.find(
                ({ from, to }) => from.account === values.from && to.account === values.to,
            ),
        [transfers, values.from, values.to],
    );
}
