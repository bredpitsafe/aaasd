import type { TComponentStatusInfo } from '@frontend/common/src/types/domain/balanceMonitor/defs';
import { useFunction } from '@frontend/common/src/utils/React/useFunction';

import { keyToField } from '../../utils';

export function useGetCSVOptions() {
    return useFunction(() => {
        return {
            fields: [
                keyToField<TComponentStatusInfo>('componentId', 'Component Id'),
                keyToField<TComponentStatusInfo>('status', 'Status'),
                keyToField<TComponentStatusInfo>('description', 'Description'),
            ],
        };
    });
}
