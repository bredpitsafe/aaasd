import type { TimeZone } from '@common/types';
import type { Nil } from '@common/types';
import type { ColDef } from '@frontend/ag-grid';
import { FLOATING_TEXT_FILTER } from '@frontend/ag-grid/src/filters';
import { getTimeColumn } from '@frontend/common/src/components/AgTable/columns/getTimeColumn';
import type { TStmPositionRow } from '@frontend/common/src/components/hooks/useStmPositions';
import type { TRobot } from '@frontend/common/src/types/domain/robots';
import { isNil } from 'lodash-es';
import { useMemo } from 'react';

export function useColumns(robot: Nil | TRobot, timeZone: TimeZone): ColDef<TStmPositionRow>[] {
    return useMemo(
        () => [
            {
                field: 'instrumentId',
                headerName: 'Instrument ID',
                sort: 'asc',
                sortIndex: 0,
            },
            {
                field: 'instrumentName',
                headerName: 'Instrument',
                ...FLOATING_TEXT_FILTER,
            },
            {
                field: 'virtualAccountId',
                headerName: 'VA ID',
                sort: 'asc',
                sortIndex: 1,
            },
            {
                field: 'virtualAccountName',
                headerName: 'VA',
                ...FLOATING_TEXT_FILTER,
            },
            {
                field: 'robotId',
                headerName: 'Robot ID',
                hide: !isNil(robot),
            },
            {
                field: 'robotName',
                headerName: 'Robot Name',
                hide: !isNil(robot),
                ...FLOATING_TEXT_FILTER,
            },
            {
                field: 'position',
                headerName: 'Position, Contracts',
            },
            {
                ...getTimeColumn<TStmPositionRow>('platformTime', 'Updated', timeZone),
                minWidth: 170,
            },
        ],
        [robot, timeZone],
    );
}
