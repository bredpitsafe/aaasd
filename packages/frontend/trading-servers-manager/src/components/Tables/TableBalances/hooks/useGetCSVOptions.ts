import type { TStmBalanceRow } from '@frontend/common/src/components/hooks/useStmBalances.ts';
import type { TRobot } from '@frontend/common/src/types/domain/robots';
import type { ISO, TimeZone } from '@frontend/common/src/types/time';
import { EDateTimeFormats } from '@frontend/common/src/types/time';
import { useFunction } from '@frontend/common/src/utils/React/useFunction';
import { toDayjsWithTimezone } from '@frontend/common/src/utils/time';
import { isNil } from 'lodash-es';

import { keyToField } from '../../utils';

export function useGetCSVOptions(robot: TRobot | undefined, timeZone: TimeZone) {
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
