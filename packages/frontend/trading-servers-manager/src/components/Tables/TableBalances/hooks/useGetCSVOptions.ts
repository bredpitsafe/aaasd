import type { ISO, Nil, TimeZone } from '@common/types';
import { EDateTimeFormats } from '@common/types';
import { toDayjsWithTimezone } from '@common/utils';
import type { TStmBalanceRow } from '@frontend/common/src/components/hooks/useStmBalances.ts';
import type { TRobot } from '@frontend/common/src/types/domain/robots';
import { useFunction } from '@frontend/common/src/utils/React/useFunction';
import { isNil } from 'lodash-es';

import { keyToField } from '../../utils/table.ts';

export function useGetCSVOptions(robot: Nil | TRobot, timeZone: TimeZone) {
    return useFunction(() => {
        return {
            fields: [
                keyToField<TStmBalanceRow>('instrumentId', 'Instrument ID'),
                keyToField<TStmBalanceRow>('instrumentName', 'Instrument'),
                keyToField<TStmBalanceRow>('virtualAccountId', 'VA ID'),
                keyToField<TStmBalanceRow>('virtualAccountName', 'VA'),
                ...(isNil(robot)
                    ? [
                          keyToField<TStmBalanceRow>('robotId', 'Robot ID'),
                          keyToField<TStmBalanceRow>('robotName', 'Robot Name'),
                      ]
                    : []),
                keyToField<TStmBalanceRow>('assetId', 'Asset ID'),
                keyToField<TStmBalanceRow>('assetName', 'Asset'),
                keyToField<TStmBalanceRow>('balance', 'Balance'),
                keyToField<TStmBalanceRow>(
                    ({ platformTime }) =>
                        isNil(platformTime)
                            ? '—'
                            : toDayjsWithTimezone(platformTime as ISO, timeZone).format(
                                  EDateTimeFormats.DateTimeMilliseconds,
                              ),
                    'Updated',
                ),
            ],
        };
    });
}
