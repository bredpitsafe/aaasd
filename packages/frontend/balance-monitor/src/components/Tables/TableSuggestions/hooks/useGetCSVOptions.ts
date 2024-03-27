import { useFunction } from '@frontend/common/src/utils/React/useFunction';

import { keyToField } from '../../utils';
import type { TPlainSuggestion } from '../defs';

export function useGetCSVOptions() {
    return useFunction(() => {
        return {
            fields: [
                keyToField<TPlainSuggestion>('group'),
                keyToField<TPlainSuggestion>('status'),
                keyToField<TPlainSuggestion>('coin'),
                keyToField<TPlainSuggestion>('source'),
                keyToField<TPlainSuggestion>('destination'),
                keyToField<TPlainSuggestion>('amount'),
            ],
        };
    });
}
