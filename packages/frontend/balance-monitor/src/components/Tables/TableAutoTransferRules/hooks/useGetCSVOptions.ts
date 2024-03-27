import type { TAutoTransferRuleInfo } from '@frontend/common/src/types/domain/balanceMonitor/defs';
import type { TimeZone } from '@frontend/common/src/types/time';
import { EDateTimeFormats } from '@frontend/common/src/types/time';
import { useFunction } from '@frontend/common/src/utils/React/useFunction';
import { toDayjsWithTimezone } from '@frontend/common/src/utils/time';

import { keyToField, valueOrArrayKeyToField } from '../../utils';

export function useGetCSVOptions(timeZone: TimeZone) {
    return useFunction(() => {
        return {
            fields: [
                keyToField<TAutoTransferRuleInfo>('id'),
                keyToField<TAutoTransferRuleInfo>(
                    ({ createTime }) =>
                        toDayjsWithTimezone(createTime, timeZone).format(
                            EDateTimeFormats.DateTimeMilliseconds,
                        ),
                    'Created',
                ),
                keyToField<TAutoTransferRuleInfo>(
                    ({ updateTime }) =>
                        toDayjsWithTimezone(updateTime, timeZone).format(
                            EDateTimeFormats.DateTimeMilliseconds,
                        ),
                    'Updated',
                ),
                keyToField<TAutoTransferRuleInfo>('username', 'User Name'),
                valueOrArrayKeyToField<TAutoTransferRuleInfo>(
                    ({ coinsMatchRule }) => coinsMatchRule,
                    'Coin',
                ),
                valueOrArrayKeyToField<TAutoTransferRuleInfo>(
                    ({ source: { exchangesMatchRule } }) => exchangesMatchRule,
                    'Source Exchange',
                ),
                valueOrArrayKeyToField<TAutoTransferRuleInfo>(
                    ({ source: { accountsMatchRule } }) => accountsMatchRule,
                    'Source Account',
                ),
                valueOrArrayKeyToField<TAutoTransferRuleInfo>(
                    ({ destination: { exchangesMatchRule } }) => exchangesMatchRule,
                    'Destination Exchange',
                ),
                valueOrArrayKeyToField<TAutoTransferRuleInfo>(
                    ({ destination: { accountsMatchRule } }) => accountsMatchRule,
                    'Destination Account',
                ),
                keyToField<TAutoTransferRuleInfo>('withOpposite', 'Both directions'),

                keyToField<TAutoTransferRuleInfo>('enableAuto', 'Enable Auto'),
                keyToField<TAutoTransferRuleInfo>('rulePriority', 'Rule Priority'),

                keyToField<TAutoTransferRuleInfo>('note', 'Note'),
            ],
        };
    });
}
