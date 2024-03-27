import type { TAmountLimitsRuleInfo } from '@frontend/common/src/types/domain/balanceMonitor/defs';
import type { TimeZone } from '@frontend/common/src/types/time';
import { EDateTimeFormats } from '@frontend/common/src/types/time';
import { useFunction } from '@frontend/common/src/utils/React/useFunction';
import { toDayjsWithTimezone } from '@frontend/common/src/utils/time';

import { keyToField, valueOrArrayKeyToField } from '../../utils';

export function useGetCSVOptions(timeZone: TimeZone) {
    return useFunction(() => {
        return {
            fields: [
                keyToField<TAmountLimitsRuleInfo>('id'),
                keyToField<TAmountLimitsRuleInfo>(
                    ({ createTime }) =>
                        toDayjsWithTimezone(createTime, timeZone).format(
                            EDateTimeFormats.DateTimeMilliseconds,
                        ),
                    'Created',
                ),
                keyToField<TAmountLimitsRuleInfo>(
                    ({ updateTime }) =>
                        toDayjsWithTimezone(updateTime, timeZone).format(
                            EDateTimeFormats.DateTimeMilliseconds,
                        ),
                    'Updated',
                ),
                keyToField<TAmountLimitsRuleInfo>('username', 'User Name'),
                valueOrArrayKeyToField<TAmountLimitsRuleInfo>(
                    ({ coinsMatchRule }) => coinsMatchRule,
                    'Coin',
                ),
                valueOrArrayKeyToField<TAmountLimitsRuleInfo>(
                    ({ source: { exchangesMatchRule } }) => exchangesMatchRule,
                    'Source Exchange',
                ),
                valueOrArrayKeyToField<TAmountLimitsRuleInfo>(
                    ({ source: { accountsMatchRule } }) => accountsMatchRule,
                    'Source Account',
                ),
                valueOrArrayKeyToField<TAmountLimitsRuleInfo>(
                    ({ destination: { exchangesMatchRule } }) => exchangesMatchRule,
                    'Destination Exchange',
                ),
                valueOrArrayKeyToField<TAmountLimitsRuleInfo>(
                    ({ destination: { accountsMatchRule } }) => accountsMatchRule,
                    'Destination Account',
                ),
                keyToField<TAmountLimitsRuleInfo>('withOpposite', 'Both directions'),

                keyToField<TAmountLimitsRuleInfo>('amountCurrency', 'Amount Currency'),
                keyToField<TAmountLimitsRuleInfo>('amountMin', 'Amount Min'),
                keyToField<TAmountLimitsRuleInfo>('amountMax', 'Amount Max'),
                keyToField<TAmountLimitsRuleInfo>('rulePriority', 'Rule Priority'),
                keyToField<TAmountLimitsRuleInfo>('doNotOverride', 'Do not override'),

                keyToField<TAmountLimitsRuleInfo>('note', 'Note'),
            ],
        };
    });
}
