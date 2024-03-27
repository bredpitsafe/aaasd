import { useModule } from '@frontend/common/src/di/react';
import type { TCoinId } from '@frontend/common/src/types/domain/balanceMonitor/defs';
import { useFunction } from '@frontend/common/src/utils/React/useFunction';
import type { TraceId } from '@frontend/common/src/utils/traceId';
import { isFailDesc, isSyncDesc } from '@frontend/common/src/utils/ValueDescriptor';
import { firstValueFrom } from 'rxjs';
import { first } from 'rxjs/operators';

import { ModuleSaveCoinStateAction } from '../../modules/actions/ModuleSaveCoinStateAction';

export function useConnectedSaveCoinStateTransfer(
    traceId: TraceId,
): (coin: TCoinId, comment: string) => Promise<boolean> {
    const { saveCoinState } = useModule(ModuleSaveCoinStateAction);

    return useFunction(async (coin: TCoinId, comment: string): Promise<boolean> => {
        const valueDescriptor = await firstValueFrom(
            saveCoinState(coin, comment, traceId).pipe(
                first(
                    (valueDescriptor) => isSyncDesc(valueDescriptor) || isFailDesc(valueDescriptor),
                ),
            ),
        );

        return isSyncDesc(valueDescriptor);
    });
}
