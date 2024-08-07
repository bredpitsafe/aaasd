import type { TAmount } from '@frontend/common/src/types/domain/balanceMonitor/defs';
import { useFunction } from '@frontend/common/src/utils/React/useFunction';
import { isNil } from 'lodash-es';

import type { TPumpDumpInfo } from '../../../../modules/actions/ModuleSubscribeToCurrentPumpDumpInfo.ts';
import { PERCENTAGE_DIGITS } from '../../../defs';
import { formattedPercentOrEmpty, getPercentOrEmpty } from '../../../utils';
import { formatAmountOrEmptyWithoutGroups, keyToField } from '../../utils';
import { RATE_AMOUNT_DIGITS } from '../defs';
import { interval2text } from '../utils';

export function useGetCSVOptions() {
    return useFunction(() => {
        return {
            fields: [
                keyToField<TPumpDumpInfo>('coin'),
                keyToField<TPumpDumpInfo>(({ startRate, endRate }) => {
                    const change = (endRate.rate - startRate.rate) as TAmount;

                    const percent = getPercentOrEmpty(Math.abs(change), startRate.rate);

                    if (isNil(percent) || change === 0) {
                        return '—';
                    }

                    return `${Math.sign(change)}${formattedPercentOrEmpty(
                        percent,
                        PERCENTAGE_DIGITS,
                    )}`;
                }, 'Rate Change'),
                keyToField<TPumpDumpInfo>(
                    ({ startRate: { rate } }) =>
                        formatAmountOrEmptyWithoutGroups(rate, RATE_AMOUNT_DIGITS),
                    'Start Rate',
                ),
                keyToField<TPumpDumpInfo>(
                    ({ endRate: { rate } }) =>
                        formatAmountOrEmptyWithoutGroups(rate, RATE_AMOUNT_DIGITS),
                    'End Rate',
                ),
                keyToField<TPumpDumpInfo>(
                    ({ timeInterval }) => interval2text(timeInterval),
                    'Time Interval',
                ),
            ],
        };
    });
}
