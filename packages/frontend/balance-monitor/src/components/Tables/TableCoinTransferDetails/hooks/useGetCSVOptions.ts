import { useFunction } from '@frontend/common/src/utils/React/useFunction';

import { keyToField } from '../../utils';
import type { TCoinTransferDetailsWithId } from '../defs';

export function useGetCSVOptions() {
    return useFunction(() => {
        return {
            fields: [
                keyToField<TCoinTransferDetailsWithId>('coin'),
                keyToField<TCoinTransferDetailsWithId>(
                    ({ source: { account } }) => account,
                    'Source',
                ),
                keyToField<TCoinTransferDetailsWithId>(
                    ({ destination: { account } }) => account,
                    'Destination',
                ),
                keyToField<TCoinTransferDetailsWithId>('network'),
                keyToField<TCoinTransferDetailsWithId>('exchangeMin', 'Exchange Min'),
                keyToField<TCoinTransferDetailsWithId>('exchangeMax', 'Exchange Max'),
                keyToField<TCoinTransferDetailsWithId>('accountMin', 'Account Min'),
                keyToField<TCoinTransferDetailsWithId>('accountMax', 'Account Max'),
                keyToField<TCoinTransferDetailsWithId>('isManualEnabled', 'Manual Enabled'),
                keyToField<TCoinTransferDetailsWithId>('isSuggestEnabled', 'Suggest Enabled'),
                keyToField<TCoinTransferDetailsWithId>('isAutoEnabled', 'Auto Enabled'),
                keyToField<TCoinTransferDetailsWithId>('priority'),
                keyToField<TCoinTransferDetailsWithId>(
                    ({ reasons }) => reasons.join('; '),
                    'Reasons',
                ),
            ],
        };
    });
}
