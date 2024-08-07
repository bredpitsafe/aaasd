import type { ISO, Nil, TimeZone } from '@common/types';
import { EDateTimeFormats } from '@common/types';
import { toDayjsWithTimezone } from '@common/utils';
import type { TStmPositionRow } from '@frontend/common/src/components/hooks/useStmPositions.ts';
import type { TRobot } from '@frontend/common/src/types/domain/robots';
import { useFunction } from '@frontend/common/src/utils/React/useFunction';
import { isNil } from 'lodash-es';

import { keyToField } from '../../utils/table.ts';

export function useGetCSVOptions(robot: Nil | TRobot, timeZone: TimeZone) {
    return useFunction(() => {
        return {
            fields: [
                keyToField<TStmPositionRow>('instrumentId', 'Instrument ID'),
                keyToField<TStmPositionRow>('instrumentName', 'Instrument'),
                keyToField<TStmPositionRow>('virtualAccountId', 'VA ID'),
                keyToField<TStmPositionRow>('virtualAccountName', 'VA'),
                ...(isNil(robot)
                    ? [
                          keyToField<TStmPositionRow>('robotId', 'Robot ID'),
                          keyToField<TStmPositionRow>('robotName', 'Robot Name'),
                      ]
                    : []),
                keyToField<TStmPositionRow>('position', 'Position, Contracts'),
                keyToField<TStmPositionRow>(
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
