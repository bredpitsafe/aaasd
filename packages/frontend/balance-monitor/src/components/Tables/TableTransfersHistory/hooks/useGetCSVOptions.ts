import type { TimeZone } from '@common/types';
import { EDateTimeFormats } from '@common/types';
import { toDayjsWithTimezone } from '@common/utils';
import type { TTransferHistoryItem } from '@frontend/common/src/types/domain/balanceMonitor/defs';
import { useFunction } from '@frontend/common/src/utils/React/useFunction';

import { keyToField } from '../../utils';
import { getCreateModeDisplayText } from './utils';

export function useGetCSVOptions(timeZone: TimeZone) {
    return useFunction(() => {
        return {
            fields: [
                keyToField<TTransferHistoryItem>('name', 'Name'),
                keyToField<TTransferHistoryItem>('clientId', 'ClientId'),
                keyToField<TTransferHistoryItem>(
                    ({ createTime }) =>
                        toDayjsWithTimezone(createTime, timeZone).format(
                            EDateTimeFormats.DateTimeMilliseconds,
                        ),
                    'Created',
                ),
                keyToField<TTransferHistoryItem>(
                    ({ updateTime }) =>
                        toDayjsWithTimezone(updateTime, timeZone).format(
                            EDateTimeFormats.DateTimeMilliseconds,
                        ),
                    'Updated',
                ),
                keyToField<TTransferHistoryItem>('state', 'Status'),
                keyToField<TTransferHistoryItem>('coin'),
                keyToField<TTransferHistoryItem>(({ source: { account } }) => account, 'Source'),
                keyToField<TTransferHistoryItem>(
                    ({ destination: { account } }) => account,
                    'Destination',
                ),
                keyToField<TTransferHistoryItem>(
                    ({ createMode }) => getCreateModeDisplayText(createMode),
                    'Creation Mode',
                ),
                keyToField<TTransferHistoryItem>('amount'),
                keyToField<TTransferHistoryItem>('txid', 'Tx ID'),
                keyToField<TTransferHistoryItem>(
                    ({ txExplorers }) => txExplorers.join('; '),
                    'Explorers',
                ),
                keyToField<TTransferHistoryItem>('stateMsg', 'State Message'),
                keyToField<TTransferHistoryItem>('stateMsgRaw', 'State Message Raw'),
            ],
        };
    });
}
