import type { TimeZone } from '@common/types';
import { EDateTimeFormats } from '@common/types';
import { toDayjsWithTimezone } from '@common/utils';
import type { TInternalTransfer } from '@frontend/common/src/types/domain/balanceMonitor/defs';
import { useFunction } from '@frontend/common/src/utils/React/useFunction';

import { keyToField } from '../../utils';

export function useGetCSVOptions(timeZone: TimeZone) {
    return useFunction(() => {
        return {
            fields: [
                keyToField<TInternalTransfer>('name', 'Name'),
                keyToField<TInternalTransfer>('clientId', 'Client ID'),
                keyToField<TInternalTransfer>('username', 'User Name'),
                keyToField<TInternalTransfer>(
                    ({ createTime }) =>
                        toDayjsWithTimezone(createTime, timeZone).format(
                            EDateTimeFormats.DateTimeMilliseconds,
                        ),
                    'Created',
                ),
                keyToField<TInternalTransfer>(
                    ({ updateTime }) =>
                        toDayjsWithTimezone(updateTime, timeZone).format(
                            EDateTimeFormats.DateTimeMilliseconds,
                        ),
                    'Updated',
                ),
                keyToField<TInternalTransfer>(
                    ({ startTime }) =>
                        toDayjsWithTimezone(startTime, timeZone).format(
                            EDateTimeFormats.DateTimeMilliseconds,
                        ),
                    'Started',
                ),
                keyToField<TInternalTransfer>('state', 'Status'),
                keyToField<TInternalTransfer>('coin'),
                keyToField<TInternalTransfer>(
                    ({ mainAccount: { account } }) => account,
                    'Main Account',
                ),
                keyToField<TInternalTransfer>(
                    ({ source: { name, section } }) => `${name} (${section})`,
                    'Source',
                ),
                keyToField<TInternalTransfer>(
                    ({ destination: { name, section } }) => `${name} (${section})`,
                    'Destination',
                ),
                keyToField<TInternalTransfer>('amount'),
                keyToField<TInternalTransfer>('transferID', 'Transfer ID'),
                keyToField<TInternalTransfer>('stateMsg', 'State Message'),
            ],
        };
    });
}
