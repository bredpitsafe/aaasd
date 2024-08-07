import type { TimeZone } from '@common/types';
import { EDateTimeFormats } from '@common/types';
import { toDayjsWithTimezone } from '@common/utils';
import type { TTransferBlockingRuleInfo } from '@frontend/common/src/types/domain/balanceMonitor/defs';
import { ERuleGroups } from '@frontend/common/src/types/domain/balanceMonitor/defs';
import { useFunction } from '@frontend/common/src/utils/React/useFunction';
import { isNil } from 'lodash-es';

import { keyToField, valueOrArrayKeyToField } from '../../utils';

export function useGetCSVOptions(timeZone: TimeZone) {
    return useFunction(() => {
        return {
            fields: [
                keyToField<TTransferBlockingRuleInfo>('id'),
                keyToField<TTransferBlockingRuleInfo>(
                    ({ createTime }) =>
                        toDayjsWithTimezone(createTime, timeZone).format(
                            EDateTimeFormats.DateTimeMilliseconds,
                        ),
                    'Created',
                ),
                keyToField<TTransferBlockingRuleInfo>(
                    ({ updateTime }) =>
                        toDayjsWithTimezone(updateTime, timeZone).format(
                            EDateTimeFormats.DateTimeMilliseconds,
                        ),
                    'Updated',
                ),
                keyToField<TTransferBlockingRuleInfo>('username', 'User Name'),
                valueOrArrayKeyToField<TTransferBlockingRuleInfo>(
                    ({ coinsMatchRule }) => coinsMatchRule,
                    'Coin',
                ),
                valueOrArrayKeyToField<TTransferBlockingRuleInfo>(
                    ({ source: { exchangesMatchRule } }) => exchangesMatchRule,
                    'Source Exchange',
                ),
                valueOrArrayKeyToField<TTransferBlockingRuleInfo>(
                    ({ source: { accountsMatchRule } }) => accountsMatchRule,
                    'Source Account',
                ),
                valueOrArrayKeyToField<TTransferBlockingRuleInfo>(
                    ({ destination: { exchangesMatchRule } }) => exchangesMatchRule,
                    'Destination Exchange',
                ),
                valueOrArrayKeyToField<TTransferBlockingRuleInfo>(
                    ({ destination: { accountsMatchRule } }) => accountsMatchRule,
                    'Destination Account',
                ),
                keyToField<TTransferBlockingRuleInfo>('withOpposite', 'Both directions'),
                keyToField<TTransferBlockingRuleInfo>('showAlert', 'Show Alert'),

                keyToField<TTransferBlockingRuleInfo>('actualStatus', 'Status'),
                keyToField<TTransferBlockingRuleInfo>(({ disabledGroups }) => {
                    switch (disabledGroups) {
                        case ERuleGroups.All:
                            return 'Suggest + Manual';
                        case ERuleGroups.Suggest:
                            return 'Suggest';
                        case ERuleGroups.Manual:
                            return 'Manual';
                        case ERuleGroups.None:
                            return 'None';
                        default:
                            return '';
                    }
                }, 'Disabled'),
                keyToField<TTransferBlockingRuleInfo>(
                    ({ since }) =>
                        isNil(since)
                            ? '—'
                            : toDayjsWithTimezone(since, timeZone).format(
                                  EDateTimeFormats.DateTimeMilliseconds,
                              ),
                    'Since',
                ),
                keyToField<TTransferBlockingRuleInfo>(
                    ({ until }) =>
                        isNil(until)
                            ? '—'
                            : toDayjsWithTimezone(until, timeZone).format(
                                  EDateTimeFormats.DateTimeMilliseconds,
                              ),
                    'Until',
                ),

                keyToField<TTransferBlockingRuleInfo>('note', 'Note'),
            ],
        };
    });
}
